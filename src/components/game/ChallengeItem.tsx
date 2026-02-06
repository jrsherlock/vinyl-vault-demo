'use client';

import { useState } from 'react';
import { Check, Lock, AlertCircle, Key } from 'lucide-react';
import { Challenge } from './useChallenge';

interface ChallengeItemProps {
  challenge: Challenge;
  onValidate: (attempt: string) => boolean;
}

export default function ChallengeItem({ challenge, onValidate }: ChallengeItemProps) {
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

  if (challenge.isSolved) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 transition-all animate-in fade-in duration-500 group">
        <div className="bg-emerald-100 p-2 rounded-full mt-0.5 text-emerald-600">
          <Check className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-emerald-900 text-sm line-through decoration-emerald-500/30">
            {challenge.title}
          </h4>
          <p className="text-emerald-700 text-xs mt-1 font-mono break-all">
            Correct: <span className="font-bold">{Array.isArray(challenge.correctValue) ? challenge.correctValue[0] : challenge.correctValue}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-slate-50 p-2 rounded-lg mt-0.5 border border-slate-100 text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
          <Lock className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-sm">{challenge.title}</h4>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">{challenge.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Enter secret flag..."
          className={`w-full text-sm pl-4 pr-20 py-2.5 bg-slate-50 border rounded-lg transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400 ${
            error 
              ? 'border-red-300 focus:ring-red-100 text-red-600 bg-red-50' 
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-300 font-mono text-slate-900'
          }`}
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
        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-1 pl-1 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Incorrect flag</span>
        </div>
      )}
    </div>
  );
}

