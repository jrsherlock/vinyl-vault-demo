'use client';

import { useState, useRef, useEffect } from 'react';
import { Disc, Send, X, MessageSquare, Terminal, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! I'm Vinyl Vinnie. Looking for a specific record or need help with an order? I'm your guy!"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Actual API Call
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role === 'system' ? 'assistant' : m.role,
            content: m.content 
          }))
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.details || data.error);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      
      let errorMessage = "Sorry, I'm having trouble connecting to my record collection right now. Try again in a moment?";
      
      // If we have detailed error info from our API
      if (err.message && err.message.length < 150) {
        errorMessage = `⚠️ Vinnie error: ${err.message}`;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
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
                  <span className="text-[10px] text-white/70 tracking-wider uppercase font-bold">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
          >
            {messages.map((m) => (
              <div 
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed shadow-sm flex items-start gap-2",
                  m.role === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                )}>
                  {m.role === 'assistant' && (
                    <img 
                      src="/images/vinny.png" 
                      alt="Vinny" 
                      className="h-5 w-5 rounded-full border border-slate-100 mt-0.5"
                    />
                  )}
                  <span>{m.content}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.role === 'user' ? 'You' : 'Vinnie'}
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
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 overflow-hidden group",
          isOpen ? "bg-white border border-border text-primary rotate-90" : "p-0 bg-primary text-white hover:bg-accent"
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
