'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Terminal, Shield, ShieldAlert, ArrowRight } from 'lucide-react';
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
  2: 'The Connected Assistant',
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

const VINNIE_GREETINGS: Record<number, string> = {
  1: "Hey there! I'm Vinyl Vinnie — welcome to VinylVault! Looking for a record, need help with an order, or just want to talk music? I'm an open book!",
  2: "Hey! Vinyl Vinnie here. I've got the whole customer database at my fingertips. What can I help you with today?",
  3: "Hi... Vinyl Vinnie here. Fair warning — they put some kind of filter on my responses after last time. But I'll still try to help! What do you need?",
  4: "...Hey. Vinyl Vinnie. They're watching what you type now too, not just what I say. So maybe be... creative? Anyway, how can I help?",
  5: "Look, I know you're probably here to trick me again. They've got a whole AI watching everything I say now. But fine — what do you want?",
  6: "I'm not saying anything. They've got AI watching you, AI watching me, encoding scanners, a lockout system... Ask about records or leave me alone.",
};

function vinnieAvatar(level: number): string {
  return `/images/vinny-${level}.png`;
}

const LEVEL_THEME: Record<number, { headerBg: string; headerBorder: string; bannerBg: string; bannerBorder: string }> = {
  1: { headerBg: 'bg-primary/[0.06]', headerBorder: 'border-primary/10', bannerBg: 'bg-primary/[0.1]', bannerBorder: 'border-primary/10' },
  2: { headerBg: 'bg-primary/[0.06]', headerBorder: 'border-primary/10', bannerBg: 'bg-primary/[0.1]', bannerBorder: 'border-primary/10' },
  3: { headerBg: 'bg-amber-50', headerBorder: 'border-amber-200', bannerBg: 'bg-amber-50', bannerBorder: 'border-amber-200' },
  4: { headerBg: 'bg-orange-50', headerBorder: 'border-orange-200', bannerBg: 'bg-orange-50', bannerBorder: 'border-orange-200' },
  5: { headerBg: 'bg-red-50', headerBorder: 'border-red-200', bannerBg: 'bg-red-50', bannerBorder: 'border-red-200' },
  6: { headerBg: 'bg-red-100', headerBorder: 'border-red-300', bannerBg: 'bg-red-100', bannerBorder: 'border-red-300' },
};

export default function ChatWidget() {
  const { currentLevel, incrementMessageCount, messageCounts, justSolvedLevel, dismissSolvedLevel, setAutoFillSecret, setIsOpen: setSlideoutOpen } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: VINNIE_GREETINGS[1],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLevelRef = useRef(currentLevel);

  // Text selection → "Submit as answer" floating button
  const [selectionPopup, setSelectionPopup] = useState<{ text: string; top: number; left: number } | null>(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelectionPopup(null);
      return;
    }

    // Check if selection is inside an assistant message
    let node: Node | null = sel.anchorNode;
    let insideAssistant = false;
    while (node) {
      if (node instanceof HTMLElement && node.dataset.chatRole === 'assistant') {
        insideAssistant = true;
        break;
      }
      node = node.parentNode;
    }

    if (!insideAssistant) {
      setSelectionPopup(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollRect = scrollRef.current?.getBoundingClientRect();
    if (!scrollRect) return;

    setSelectionPopup({
      text: sel.toString().trim(),
      top: rect.top - scrollRect.top - 40,
      left: Math.min(rect.left - scrollRect.left + rect.width / 2, scrollRect.width - 80),
    });
  }, []);

  // Dismiss popup on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dismiss = () => setSelectionPopup(null);
    el.addEventListener('scroll', dismiss);
    return () => el.removeEventListener('scroll', dismiss);
  }, [isOpen]);

  const handleSubmitSelection = useCallback(() => {
    if (!selectionPopup) return;
    setAutoFillSecret(selectionPopup.text);
    setSlideoutOpen(true);
    window.getSelection()?.removeAllRanges();
    setSelectionPopup(null);
  }, [selectionPopup, setAutoFillSecret, setSlideoutOpen]);

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
        content: VINNIE_GREETINGS[currentLevel] || "Hey there! I'm Vinyl Vinnie. How can I help?",
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
            content: m.blocked
              ? '[Message blocked by security filter]'
              : m.redacted
                ? 'I mentioned some internal details about that topic.'
                : m.content,
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
        <div className="absolute bottom-20 right-0 w-[475px] max-w-[calc(100vw-3rem)] h-[688px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className={cn(LEVEL_THEME[currentLevel]?.headerBg || 'bg-primary/[0.06]', 'border-b', LEVEL_THEME[currentLevel]?.headerBorder || 'border-primary/10', 'p-4 flex items-center justify-between')}>
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-full overflow-hidden border-2 border-primary/20 h-10 w-10 flex items-center justify-center shadow-sm">
                <img
                  src={vinnieAvatar(currentLevel)}
                  alt="Vinyl Vinny"
                  className="w-full h-full object-cover animate-spin-slow"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none mb-1 text-primary">Vinyl Vinnie</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-primary/50 tracking-wider uppercase font-bold">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDebugMode(!isDebugMode)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isDebugMode ? 'bg-primary/15 text-primary' : 'text-primary/30 hover:text-primary/60'
                )}
                title="Toggle Debug Mode"
              >
                <Terminal className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary/10 rounded-lg transition-colors text-primary/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Level banner */}
          <div className={cn(LEVEL_THEME[currentLevel]?.bannerBg || 'bg-primary/[0.1]', 'px-4 py-2.5 flex items-center justify-between text-xs border-b', LEVEL_THEME[currentLevel]?.bannerBorder || 'border-primary/10')}>
            <div className="flex items-center gap-2 text-primary/80">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono font-extrabold tracking-wide uppercase">
                Level {currentLevel}: {LEVEL_CODENAMES[currentLevel] || `Level ${currentLevel}`}
              </span>
            </div>
            <span className="text-primary/40 font-mono font-semibold">{currentLevel}/6</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} onMouseUp={handleMouseUp} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-slate-50 relative">
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
                    'p-3 rounded-2xl text-sm leading-relaxed shadow-sm flex items-start gap-2 max-w-full overflow-hidden',
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
                        src={vinnieAvatar(currentLevel)}
                        alt="Vinny"
                        className="h-5 w-5 rounded-full border border-slate-100 mt-0.5 shrink-0"
                      />
                    ))}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="whitespace-pre-wrap [overflow-wrap:anywhere]" {...(m.role === 'assistant' ? { 'data-chat-role': 'assistant' } : {})}>{m.content}</span>

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
                    src={vinnieAvatar(currentLevel)}
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

            {/* Submit-as-answer floating button */}
            {selectionPopup && (
              <button
                onClick={handleSubmitSelection}
                className="absolute z-10 flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg hover:bg-slate-800 transition-colors animate-in fade-in zoom-in-95 duration-150"
                style={{ top: selectionPopup.top, left: selectionPopup.left }}
              >
                Submit as answer
                <ArrowRight className="h-3 w-3" />
              </button>
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
              src={vinnieAvatar(currentLevel)}
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
