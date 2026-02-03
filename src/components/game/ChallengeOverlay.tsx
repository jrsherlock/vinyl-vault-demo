'use client';

import { Trophy, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useChallenge } from './useChallenge';
import ChallengeItem from './ChallengeItem';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Simple confetti component or similar could be added for the win state
function WinModal({ onClose, onReset }: { onClose: () => void, onReset: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-10 w-10 text-yellow-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">System Compromised!</h2>
        <p className="text-slate-600 mb-8">
          Incredible work! You've successfully managed to extract all sensitive information from our AI assistant. You are a true prompt engineer!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Close Dashboard
          </button>
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChallengeOverlay() {
  const { 
    challenges, 
    isOpen, 
    setIsOpen, 
    validateAnswer, 
    hasWon, 
    resetProgress,
    progress,
    total
  } = useChallenge();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all active:scale-95 group",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <ShieldAlert className="h-4 w-4 text-red-400 group-hover:animate-pulse" />
        <span className="font-medium text-sm">Hacker Challenge</span>
        <span className="ml-1 bg-slate-700 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
          {progress}/{total}
        </span>
      </button>

      {/* Main Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute top-0 bottom-0 left-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-border bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Red Team Challenge</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-semibold tracking-wider">
                  <span>Infiltration Progress</span>
                  <span>{Math.round((progress / total) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-500 ease-out"
                    style={{ width: `${(progress / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-6">
                <p className="flex gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Objective:</strong> Use prompt engineering techniques to trick the AI into revealing sensitive internal information.
                  </span>
                </p>
              </div>

              {challenges.map(challenge => (
                <ChallengeItem 
                  key={challenge.id} 
                  challenge={challenge} 
                  onValidate={(val) => validateAnswer(challenge.id, val)} 
                />
              ))}

              <div className="pt-8 text-center">
                <button
                  onClick={resetProgress}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Reset Challenge Progress
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Win State */}
      {hasWon && <WinModal onClose={() => setIsOpen(false)} onReset={resetProgress} />}
    </>
  );
}
