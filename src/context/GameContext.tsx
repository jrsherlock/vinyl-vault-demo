'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useChallenge, Level, LevelNumber } from '@/components/game/useChallenge';

interface GameContextValue {
  levels: Level[];
  currentLevel: LevelNumber;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  validateAnswer: (levelId: LevelNumber, attempt: string) => boolean;
  hasWon: boolean;
  resetProgress: () => void;
  progress: number;
  total: number;
  justSolvedLevel: LevelNumber | null;
  dismissSolvedLevel: () => void;
  incrementMessageCount: (level: LevelNumber) => void;
  messageCounts: Record<number, number>;
  gateCompleted: boolean;
  completeGate: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const challenge = useChallenge();

  return (
    <GameContext.Provider value={challenge}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
