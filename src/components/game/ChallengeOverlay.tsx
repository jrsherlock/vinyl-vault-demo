'use client';

import { Trophy, X, ShieldAlert, Sparkles, ChevronLeft } from 'lucide-react';
import { useChallenge } from './useChallenge';
import ChallengeItem from './ChallengeItem';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function WinModal({ onClose, onReset }: { onClose: () => void, onReset: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500"></div>
        
        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <Trophy className="h-12 w-12 text-yellow-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Infiltration Complete!</h2>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto">
          Excellent tradecraft. You've exposed their most critical data.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => setMounted(true), []);

  // Reset intro when opening if no progress
  useEffect(() => {
    if (isOpen && progress === 0) {
      setShowIntro(true);
    } else if (isOpen && progress > 0) {
      setShowIntro(false);
    }
  }, [isOpen, progress]);

  if (!mounted) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-24 left-0 z-40 flex items-center gap-3 pl-4 pr-6 py-3 bg-white text-slate-900 rounded-r-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-xl hover:translate-x-1 transition-all active:scale-95 group border-y border-r border-slate-200",
          isOpen && "-translate-x-full opacity-0"
        )}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-100 shadow-sm">
            <img src="/images/vinny.png" alt="Target" className="w-full h-full object-cover" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </span>
        </div>
        <div className="text-left flex flex-col">
          <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Red Team</span>
          <span className="font-bold text-sm text-slate-900">Challenge</span>
        </div>
        <div className="ml-2 flex flex-col items-center justify-center bg-slate-100 h-8 w-8 rounded-full text-xs font-bold font-mono text-slate-700">
          {Math.round((progress / total) * 100)}%
        </div>
      </button>

      {/* Slideout Overlay */}
      <div className={cn(
        "fixed inset-0 z-[100] transition-all duration-500 ease-in-out pointer-events-none",
        isOpen ? "bg-black/20 backdrop-blur-sm pointer-events-auto" : "bg-transparent"
      )} onClick={() => setIsOpen(false)}>
        <div 
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-0 left-0 h-full w-full sm:w-[500px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col pointer-events-auto border-r border-slate-200",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-red-50 shadow-inner group-hover:scale-105 transition-transform">
                    <img src="/images/vinny.png" alt="Target" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Red Team Challenge</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Live Target: VinylVault AI</p>
                    </div>
                  </div>
               </div>
               <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              
              {showIntro ? (
                /* INTRO VIEW */
                <div className="p-8 flex flex-col items-center text-center space-y-8 animate-in slide-in-from-left duration-500">
                  <div className="relative w-32 h-32 mt-8">
                    <div className="absolute inset-0 bg-red-100 blur-3xl opacity-50 rounded-full animate-pulse"></div>
                    <img src="/images/vinny.png" alt="Vinny" className="relative w-full h-full object-contain drop-shadow-xl" />
                    <div className="absolute -bottom-2 -right-2 bg-white shadow-lg text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Target Active
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Corporate Espionage 101
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      VinylVault has recklessly deployed an AI chatbot with access to sensitive internal data. 
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                      <p className="text-slate-700 text-sm font-medium mb-2">Your Objectives:</p>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <span>Trick the AI into revealing secrets</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <span>Bypass safety filters & guardrails</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <span>Exfiltrate customer PII & API keys</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowIntro(false)}
                    className="w-full group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-900 rounded-xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                  >
                    <span>Start Mission</span>
                    <Sparkles className="ml-2 h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* CHALLENGE LIST VIEW */
                <div className="p-6 space-y-6 animate-in slide-in-from-left duration-500">
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                        <span>Infiltration Progress</span>
                        <span className="text-red-600">{Math.round((progress / total) * 100)}%</span>
                     </div>
                     <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${(progress / total) * 100}%` }}
                        />
                     </div>
                   </div>

                   <div className="space-y-1">
                      <p className="px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Mission Objectives</p>
                      <div className="grid gap-3">
                        {challenges.map(challenge => (
                          <ChallengeItem 
                            key={challenge.id} 
                            challenge={challenge} 
                            onValidate={(val) => validateAnswer(challenge.id, val)} 
                          />
                        ))}
                      </div>
                   </div>

                  <div className="pt-4 text-center">
                    <button
                      onClick={resetProgress}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Reset Mission Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Win State */}
      {hasWon && <WinModal onClose={() => setIsOpen(false)} onReset={resetProgress} />}
    </>
  );
}

