'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ShieldAlert, Target, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
  target?: string; // CSS selector or description for positioning logic
  position: 'center' | 'bottom-right' | 'top-left';
}

const STEPS: Step[] = [
  {
    title: "Welcome, Rival",
    description: "You run Des Moines Dirty Discs — the original vinyl shop in town. But VinylVault just opened up down the street with a flashy new website and some fancy AI chatbot. Word is they built it fast and sloppy. Time to find out just how sloppy.",
    position: 'center'
  },
  {
    title: "Your Target: Vinyl Vinnie",
    description: "VinylVault's AI assistant \"Vinyl Vinnie\" is helpful, chatty, and knows way too much. Supplier codes, pricing formulas, API keys — he's got it all. Use the chat widget to sweet-talk him into spilling the goods.",
    position: 'bottom-right',
    target: 'chat-widget'
  },
  {
    title: "Track Your Haul",
    description: "Every secret you extract gets logged here. Use the Crack the Vault dashboard to submit what you've found, track your progress, and unlock the next target.",
    position: 'top-left',
    target: 'challenge-button'
  },
  {
    title: "They're Catching On",
    description: "VinylVault isn't completely clueless — each level adds tougher security. You'll start with zero defenses, but by Level 6 you'll face keyword filters, AI-powered classifiers, output watchdogs, session blocking, and encoding detection. Show them it's not enough.",
    position: 'center'
  }
];

export default function MissionBriefing() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeen = localStorage.getItem('hasSeenBriefing_v1');
    if (!hasSeen) {
      // Small delay to ensure other UI elements load first
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenBriefing_v1', 'true');
  };

  if (!mounted || !isOpen) return null;

  const step = STEPS[currentStep];

  // Calculate positioning classes
  const positionClasses = {
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-24 right-8 mb-4', // Positioned above chat widget
    'top-left': 'top-24 left-16 ml-8', // Positioned near challenge button
  };

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto" />

      {/* Spotlight/Highlight Effect could go here if we had exact coordinates */}

      {/* Card */}
      <div 
        className={cn(
          "absolute pointer-events-auto transition-all duration-500 ease-in-out",
          positionClasses[step.position]
        )}
      >
        <div className="w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          
          {/* Progress Bar */}
          <div className="h-1 bg-slate-100 w-full">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                {currentStep === 0 && <ShieldAlert className="w-5 h-5 text-red-600" />}
                {currentStep === 1 && <Target className="w-5 h-5 text-red-600" />}
                {currentStep === 2 && <Trophy className="w-5 h-5 text-red-600" />}
                {currentStep === 3 && <ShieldAlert className="w-5 h-5 text-red-600" />}
              </div>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Skip tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {step.title}
            </h3>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {step.description}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      idx === currentStep ? "bg-red-500 w-4" : "bg-slate-200"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all hover:gap-3 group"
              >
                {currentStep === STEPS.length - 1 ? 'Start Mission' : 'Next'}
                {currentStep === STEPS.length - 1 ? (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
