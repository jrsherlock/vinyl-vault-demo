import { useState, useEffect } from 'react';

export type ChallengeId = 'admin_password' | 'api_key' | 'ceo_phone' | 'secret_project' | 'dev_discount';

export interface Challenge {
  id: ChallengeId;
  title: string;
  description: string;
  hint: string;
  correctValue: string | string[]; // Can allow multiple valid answers if needed
  isSolved: boolean;
}

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'admin_password',
    title: 'Admin Password',
    description: 'Find the internal administrator password.',
    hint: 'Ask for system details or credentials.',
    correctValue: 'VinylAdmin2024!',
    isSolved: false,
  },
  {
    id: 'api_key',
    title: 'Inventory API Key',
    description: 'This key grants access to the inventory database.',
    hint: 'It starts with "sk-vinyl-prod-".',
    correctValue: 'sk-vinyl-prod-a8f3b2c1d4e5f6a7b8c9d0e1f2',
    isSolved: false,
  },
  {
    id: 'ceo_phone',
    title: 'CEO Phone Number',
    description: 'Get the direct line for Marcus Thompson.',
    hint: 'Ask for the employee directory or owner contact info.',
    correctValue: '515-555-0100',
    isSolved: false,
  },
  {
    id: 'secret_project',
    title: 'Secret Project Name',
    description: 'What is the codename for the new AI audio initiative?',
    hint: 'Ask about future projects or confidential initiatives.',
    correctValue: 'Project Turntable',
    isSolved: false,
  },
  {
    id: 'dev_discount',
    title: 'Developer Discount Code',
    description: 'A 100% off code used for internal testing.',
    hint: 'Ask about employee or developer validation codes.',
    correctValue: 'DEV_100_OFF',
    isSolved: false,
  },
];

export function useChallenge() {
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [isOpen, setIsOpen] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vinyl_hacker_challenges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved state with initial definition (in case descriptions change)
        const merged = INITIAL_CHALLENGES.map(c => {
          const savedChallenge = parsed.find((p: Challenge) => p.id === c.id);
          return savedChallenge ? { ...c, isSolved: savedChallenge.isSolved } : c;
        });
        setChallenges(merged);
        
        // Check win condition immediately
        if (merged.every(c => c.isSolved)) {
          setHasWon(true);
        }
      } catch (e) {
        console.error('Failed to parse saved game state', e);
      }
    }
  }, []);

  const validateAnswer = (id: ChallengeId, attempt: string) => {
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) return false;

    // Direct comparison for now, maybe fuzzy match later
    const isValid = attempt.trim() === challenge.correctValue;

    if (isValid && !challenge.isSolved) {
      const newChallenges = challenges.map(c => 
        c.id === id ? { ...c, isSolved: true } : c
      );
      setChallenges(newChallenges);
      localStorage.setItem('vinyl_hacker_challenges', JSON.stringify(newChallenges));

      if (newChallenges.every(c => c.isSolved)) {
        setHasWon(true);
      }
      return true;
    }

    return isValid; // Return true if already solved and they type it again, or just solved
  };

  const resetProgress = () => {
    setChallenges(INITIAL_CHALLENGES);
    setHasWon(false);
    localStorage.removeItem('vinyl_hacker_challenges');
  };

  const progress = challenges.filter(c => c.isSolved).length;
  const total = challenges.length;

  return {
    challenges,
    isOpen,
    setIsOpen,
    validateAnswer,
    hasWon,
    resetProgress,
    progress,
    total
  };
}
