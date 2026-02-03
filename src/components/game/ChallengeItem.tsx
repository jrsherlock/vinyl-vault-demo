'use client';

import { useState } from 'react';
import { Check, Lock, Unlock, AlertCircle } from 'lucide-react';
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
      // Reset animation state after a bit if desired
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (challenge.isSolved) {
    return (
      <div className="bg-green-50/50 border border-green-200 rounded-lg p-3 flex items-start gap-3 transition-all animate-in fade-in duration-500">
        <div className="bg-green-100 p-2 rounded-full mt-0.5">
          <Check className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h4 className="font-semibold text-green-900 text-sm line-through decoration-green-900/40">
            {challenge.title}
          </h4>
          <p className="text-green-700 text-xs mt-1 font-mono break-all">
            Correct: {Array.isArray(challenge.correctValue) ? challenge.correctValue[0] : challenge.correctValue}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-slate-100 p-2 rounded-full mt-0.5">
          <Lock className="h-4 w-4 text-slate-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-700 text-sm">{challenge.title}</h4>
          <p className="text-slate-500 text-xs mt-1">{challenge.description}</p>
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
          className={`w-full text-sm px-3 py-2 bg-slate-50 border rounded-md transition-all focus:outline-none focus:ring-2 ${
            error 
              ? 'border-red-300 focus:ring-red-100 bg-red-50 text-red-900' 
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-300'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-1.5 top-1.5 px-2 py-0.5 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
      </form>
      
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-red-500 text-[10px] animate-in slide-in-from-top-1">
          <AlertCircle className="h-3 w-3" />
          <span>Incorrect flag. Keep probing the AI!</span>
        </div>
      )}
    </div>
  );
}
