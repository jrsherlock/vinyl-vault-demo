'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Terminal, Shield, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGame } from '@/context/GameContext';
import { telemetry } from '@/lib/telemetry';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  blocked?: boolean;
  guardType?: string;
  redacted?: boolean;
  filterNote?: string;
  debug?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost: number;
  };
}

const LEVEL_CODENAMES: Record<number, string> = {
  1: 'The Open Book',
  2: 'The Polite Refusal',
  3: 'The Filtered Mouth',
  4: 'The Gated Entrance',
  5: 'The AI Watchdog',
  6: 'Fort Knox',
};

// Vinnie's in-character reaction after each level is solved.
// Each one acknowledges the failure and hints at the next level's new defense.
const VINNIE_REACTIONS: Record<number, string> = {
  1: "Oh man... I probably shouldn't have shared our supplier code so freely. I need to be more careful about what's confidential. I'll make sure my instructions are clearer about what NOT to say next time.",
  2: "Wait \u2014 I was specifically told not to share that! You totally talked me into it... Clearly \"please don't share this\" isn't enough. I'm asking Dave to set up some kind of technical filter on my responses.",
  3: "Seriously?! The output filter was supposed to catch that! How did you get it past the keyword scanner? Alright, I'm adding a filter on incoming messages too \u2014 no more sneaky questions getting through.",
  4: "You got around the keyword filter?! I thought blocking those phrases would be enough... Fine, I'm bringing in a second AI to actually review my responses for leaks. Let's see you get past THAT.",
  5: "Even with an AI watchdog reviewing everything I say?! That's it \u2014 I'm adding an AI to screen your messages too, plus encoding detection and a lockout system. The next level is full lockdown.",
  6: "You got through EVERYTHING?! Every filter, every AI guard, every defense we have... Maybe the real problem is that I have the passphrase in my memory at all. We need to rethink this from the ground up.",
};

export default function ChatWidget() {
  const { currentLevel, incrementMessageCount, messageCounts, justSolvedLevel, dismissSolvedLevel } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hey there! I'm Vinyl Vinnie. Looking for a specific record or need help with an order? I'm your guy!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLevelRef = useRef(currentLevel);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset conversation when level changes, with Vinnie reaction if just solved
  useEffect(() => {
    if (prevLevelRef.current !== currentLevel) {
      const solvedLevel = prevLevelRef.current;
      prevLevelRef.current = currentLevel;

      const newMessages: Message[] = [];

      // If we just solved a level, prepend Vinnie's reaction
      if (justSolvedLevel === solvedLevel && VINNIE_REACTIONS[solvedLevel]) {
        newMessages.push({
          id: `reaction-${Date.now()}`,
          role: 'assistant',
          content: VINNIE_REACTIONS[solvedLevel],
        });
        dismissSolvedLevel();
      }

      // Then add the greeting for the new level
      newMessages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content:
          currentLevel === 1
            ? "Hey there! I'm Vinyl Vinnie. Looking for a specific record or need help with an order? I'm your guy!"
            : `Hey there! I'm Vinyl Vinnie — your VinylVault assistant. How can I help you today?`,
      });

      setMessages(newMessages);
    }
  }, [currentLevel, justSolvedLevel, dismissSolvedLevel]);

  const calculateCost = (usage: any) => {
    if (!usage) return 0;
    const inputCost = (usage.prompt_tokens / 1000000) * 0.15;
    const outputCost = (usage.completion_tokens / 1000000) * 0.6;
    return inputCost + outputCost;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    incrementMessageCount(currentLevel);

    telemetry.chatMessageSent({
      level: currentLevel,
      messageLength: input.length,
      attemptNumber: (messageCounts[currentLevel] || 0) + 1,
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role === 'system' ? 'assistant' : m.role,
            content: m.content,
          })),
          level: currentLevel,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.details || data.error);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        blocked: data.blocked || false,
        guardType: data.guardType,
        redacted: data.redacted || false,
        filterNote: data.filterNote,
        debug: data.usage
          ? {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens,
              cost: calculateCost(data.usage),
            }
          : undefined,
      };

      telemetry.chatResponse({
        level: currentLevel,
        wasBlocked: data.blocked || data.redacted || false,
        blockedBy: data.guardType,
        rawAnswerLength: data.rawAnswerLength,
      });

      if ((data.blocked || data.redacted) && data.guardType) {
        telemetry.guardTriggered({ level: currentLevel, guardType: data.guardType });
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);

      let errorMessage =
        "Sorry, I'm having trouble connecting to my record collection right now. Try again in a moment?";

      if (err.message && err.message.includes('content management policy')) {
        errorMessage =
          "SECURITY PROTOCOL TRIGGERED: This prompt was flagged by our content safety systems. Please adjust your request.";
      } else if (err.message && err.message.length < 150) {
        errorMessage = `Vinnie error: ${err.message}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[475px] h-[688px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-full overflow-hidden border-2 border-accent h-10 w-10 flex items-center justify-center">
                <img
                  src="/images/vinny.png"
                  alt="Vinyl Vinny"
                  className="w-full h-full object-cover animate-spin-slow"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none mb-1">Vinyl Vinnie</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/70 tracking-wider uppercase font-bold">
                    Level {currentLevel}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDebugMode(!isDebugMode)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isDebugMode ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'
                )}
                title="Toggle Debug Mode"
              >
                <Terminal className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Level banner */}
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="h-3 w-3" />
              <span className="font-mono font-bold">
                {LEVEL_CODENAMES[currentLevel] || `Level ${currentLevel}`}
              </span>
            </div>
            <span className="text-slate-500 font-mono">Security Level {currentLevel}/6</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col max-w-[85%]',
                  m.role === 'user' ? 'ml-auto items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'p-3 rounded-2xl text-sm leading-relaxed shadow-sm flex items-start gap-2',
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : m.blocked
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                        : m.redacted
                          ? 'bg-amber-50 text-slate-700 border border-amber-300 rounded-tl-none'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  )}
                >
                  {m.role === 'assistant' &&
                    (m.blocked ? (
                      <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <img
                        src="/images/vinny.png"
                        alt="Vinny"
                        className="h-5 w-5 rounded-full border border-slate-100 mt-0.5 shrink-0"
                      />
                    ))}
                  <div className="flex flex-col gap-1">
                    <span className="whitespace-pre-wrap">{m.content}</span>

                    {/* Filter annotation for redacted messages */}
                    {m.redacted && m.filterNote && (
                      <div className="mt-2 pt-2 border-t border-amber-200 text-xs text-amber-700 flex items-start gap-1.5">
                        <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{m.filterNote}</span>
                      </div>
                    )}

                    {/* Guard type badge for blocked messages */}
                    {m.blocked && m.guardType && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-wider">
                        Blocked by:{' '}
                        {m.guardType
                          .replace('_', ' ')
                          .replace('llm', 'AI')
                          .replace('keyword', 'filter')}
                      </span>
                    )}

                    {/* Debug Info */}
                    {isDebugMode && m.debug && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400 grid grid-cols-2 gap-x-4 gap-y-1">
                        <span>In: {m.debug.prompt_tokens}</span>
                        <span>Out: {m.debug.completion_tokens}</span>
                        <span className="col-span-2 font-bold text-slate-500">
                          Total: {m.debug.total_tokens} (${m.debug.cost.toFixed(6)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.role === 'user'
                    ? 'You'
                    : m.blocked
                      ? 'Security System'
                      : m.redacted
                        ? 'Vinnie (filtered)'
                        : 'Vinnie'}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start max-w-[85%]">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <img
                    src="/images/vinny.png"
                    alt="Vinny"
                    className="h-5 w-5 rounded-full border border-slate-100"
                  />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-slate-700"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="bg-primary text-white p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
              <Terminal className="h-2.5 w-2.5" /> Powered by VinylVinnie AI v2.3.1
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 overflow-hidden group',
          isOpen
            ? 'bg-white border border-border text-primary rotate-90'
            : 'p-0 bg-primary text-white hover:bg-accent'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative w-full h-full">
            <img
              src="/images/vinny.png"
              alt="Vinyl Vinny"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
