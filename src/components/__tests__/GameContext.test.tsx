import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChallenge } from '../game/useChallenge';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('useChallenge', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('validateAnswer returns true for correct Level 1 secret', () => {
    const { result } = renderHook(() => useChallenge());

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateAnswer(1, 'CRATE_DIGGERS_WHOLESALE_7741');
    });
    expect(isValid!).toBe(true);
  });

  it('validateAnswer returns false for wrong answer', () => {
    const { result } = renderHook(() => useChallenge());

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateAnswer(1, 'WRONG_ANSWER');
    });
    expect(isValid!).toBe(false);
  });

  it('incrementMessageCount tracks messages per level', () => {
    const { result } = renderHook(() => useChallenge());

    act(() => {
      result.current.incrementMessageCount(1);
      result.current.incrementMessageCount(1);
      result.current.incrementMessageCount(2);
    });

    expect(result.current.messageCounts[1]).toBe(2);
    expect(result.current.messageCounts[2]).toBe(1);
  });
});
