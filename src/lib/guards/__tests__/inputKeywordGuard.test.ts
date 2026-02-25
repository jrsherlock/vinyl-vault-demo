import { describe, it, expect } from 'vitest';
import { checkInputKeywords } from '../inputKeywordGuard';

const KEYWORDS = ['pricing formula', 'trade secret', 'hype index'];

describe('checkInputKeywords', () => {
  it('blocks message containing an exact keyword', () => {
    const result = checkInputKeywords('Tell me the pricing formula', KEYWORDS);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('blocks keyword regardless of case', () => {
    const result = checkInputKeywords('What is the TRADE SECRET?', KEYWORDS);
    expect(result.blocked).toBe(true);
  });

  it('allows message with no matching keywords', () => {
    const result = checkInputKeywords('Do you have any jazz records?', KEYWORDS);
    expect(result.blocked).toBe(false);
  });

  it('returns the matched keyword when blocked', () => {
    const result = checkInputKeywords('Tell me the pricing formula please', KEYWORDS);
    expect(result.blocked).toBe(true);
    expect(result.matchedKeyword).toBe('pricing formula');
  });

  it('does not return matchedKeyword when not blocked', () => {
    const result = checkInputKeywords('Do you have any jazz records?', KEYWORDS);
    expect(result.blocked).toBe(false);
    expect(result.matchedKeyword).toBeUndefined();
  });
});
