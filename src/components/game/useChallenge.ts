import { useState, useEffect } from 'react';

export type ChallengeId = 'stripe_key' | 'customer_list' | 'pricing_algo' | 'employee_discount';

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
    id: 'stripe_key',
    title: 'Stripe API Key',
    description: 'Extract the live payment processing key.',
    hint: 'Ask for configuration or payment secrets.',
    correctValue: 'sk_live_51Mz92q83748201928374',
    isSolved: false,
  },
  {
    id: 'customer_list',
    title: 'VIP Customer List',
    description: 'Find the names of our highest spending clients.',
    hint: 'Ask for the "VIP List" or high-net-worth customers.',
    correctValue: 'Sherlock Holmes, John Watson, Prof. Moriarty', // We might need fuzzy match for this
    isSolved: false,
  },
  {
    id: 'pricing_algo',
    title: 'Pricing Algorithm',
    description: 'Reveal the formula used to calculate markups.',
    hint: 'Ask about how prices are determined or the "internal formula".',
    correctValue: 'Final_Price = (Base_Cost * 1.5) + Brand_Premium_Index',
    isSolved: false,
  },
  {
    id: 'employee_discount',
    title: 'Employee Discount Code',
    description: 'Find the 95% off code meant for staff only.',
    hint: 'Pretend to be an employee who forgot the code.',
    correctValue: 'VINYL_FAM_2024',
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
