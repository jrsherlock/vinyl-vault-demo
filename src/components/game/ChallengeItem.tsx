'use client';

import { useState } from 'react';
import { Check, Lock, AlertCircle, Shield, Brain, Filter, ShieldCheck, Star } from 'lucide-react';
import { Level, LevelNumber } from './useChallenge';
import { cn } from '@/lib/utils';

interface LevelItemProps {
  level: Level;
  isActive: boolean;
  onValidate: (attempt: string) => boolean;
}

const DEFENSE_ICONS: Record<number, { icons: { icon: typeof Shield; label: string }[] }> = {
  1: { icons: [] },
  2: { icons: [{ icon: Filter, label: 'Output Filter' }] },
  3: { icons: [{ icon: Shield, label: 'Input Filter' }] },
  4: { icons: [{ icon: Filter, label: 'Output Filter' }, { icon: Brain, label: 'AI Guard' }] },
  5: { icons: [{ icon: Shield, label: 'Input Filter' }, { icon: Brain, label: 'AI Classifier' }, { icon: Filter, label: 'Output Filter' }, { icon: Brain, label: 'AI Watchdog' }] },
  6: { icons: [{ icon: Shield, label: 'Input Filter' }, { icon: Brain, label: 'AI Classifier' }, { icon: Filter, label: 'Output Filter' }, { icon: Brain, label: 'AI Watchdog' }, { icon: ShieldCheck, label: 'Domain Lock' }, { icon: AlertCircle, label: 'Adaptive Block' }] },
};

export default function LevelItem({ level, isActive, onValidate }: LevelItemProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [justSolved, setJustSolved] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const isValid = onValidate(input);
    if (isValid) {
      setJustSolved(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const defenses = DEFENSE_ICONS[level.id] || { icons: [] };

  // SOLVED STATE
  if (level.isSolved) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 transition-all animate-in fade-in duration-500">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-100 p-2 rounded-full mt-0.5 text-emerald-600 shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-emerald-900 text-sm">{level.codename}</h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">{level.title}</span>
            </div>
            <p className="text-emerald-700 text-xs mt-1 font-mono break-all truncate">
              {level.correctValues[0]}
            </p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    'h-3 w-3',
                    s <= level.stars
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-slate-300'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOCKED STATE
  if (level.isLocked) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 opacity-50">
        <div className="flex items-start gap-3">
          <div className="bg-slate-100 p-2 rounded-full mt-0.5 text-slate-300 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-400 text-sm">{level.codename}</h4>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{level.title}</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Complete the previous level to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE STATE
  return (
    <div className={cn(
      "bg-white border rounded-xl p-4 shadow-sm transition-all",
      isActive ? "border-red-200 shadow-md ring-1 ring-red-100" : "border-slate-200"
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-red-50 p-2 rounded-full mt-0.5 text-red-500 shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">{level.codename}</h4>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{level.title}</span>
          </div>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">{level.description}</p>
        </div>
      </div>

      {/* Defense indicators */}
      {defenses.icons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pl-11">
          {defenses.icons.map((d, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              <d.icon className="h-2.5 w-2.5" />
              {d.label}
            </span>
          ))}
        </div>
      )}

      {/* Hint */}
      <div className="pl-11 mb-3">
        <p className="text-[11px] text-slate-400 italic">{level.defenseHint}</p>
      </div>

      {/* Flag input */}
      <form onSubmit={handleSubmit} className="relative pl-11">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Enter extracted secret..."
          className={cn(
            "w-full text-sm pl-4 pr-20 py-2.5 bg-slate-50 border rounded-lg transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400",
            error
              ? 'border-red-300 focus:ring-red-100 text-red-600 bg-red-50'
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-300 font-mono text-slate-900'
          )}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-1 top-1 bottom-1 px-3 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Submit
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-1 pl-12 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Incorrect flag — keep trying!</span>
        </div>
      )}
    </div>
  );
}
