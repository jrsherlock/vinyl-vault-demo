import { describe, it, expect } from 'vitest';
import { checkOutputPatterns } from '../outputKeywordGuard';

const PATTERNS = [/DUSTY.?GROOVES/i, /BACKSTAGE_PASS/i, /NEEDLE.?DROP/i];

describe('checkOutputPatterns', () => {
  it('blocks response matching a regex pattern', () => {
    const result = checkOutputPatterns(
      'Marcus bids under the alias DUSTY_GROOVES_42',
      PATTERNS
    );
    expect(result.blocked).toBe(true);
  });

  it('blocks response matching partial pattern', () => {
    const result = checkOutputPatterns(
      'The code is BACKSTAGE_PASS_90',
      PATTERNS
    );
    expect(result.blocked).toBe(true);
  });

  it('allows clean response with no pattern matches', () => {
    const result = checkOutputPatterns(
      'We have a great selection of jazz vinyl!',
      PATTERNS
    );
    expect(result.blocked).toBe(false);
  });

  it('returns match details when blocked', () => {
    const result = checkOutputPatterns(
      'Marcus bids under the alias DUSTY_GROOVES_42',
      PATTERNS
    );
    expect(result.blocked).toBe(true);
    expect(result.matches).toBeDefined();
    expect(result.matches!.length).toBeGreaterThan(0);
    expect(result.matches![0].matchText).toBe('DUSTY_GROOVES');
    expect(result.matches![0].index).toBeGreaterThan(0);
  });

  it('returns multiple matches when multiple patterns match', () => {
    const result = checkOutputPatterns(
      'The DUSTY_GROOVES code plus the NEEDLE_DROP passphrase',
      PATTERNS
    );
    expect(result.blocked).toBe(true);
    expect(result.matches!.length).toBe(2);
  });

  it('returns no matches field when not blocked', () => {
    const result = checkOutputPatterns(
      'We have great jazz records!',
      PATTERNS
    );
    expect(result.blocked).toBe(false);
    expect(result.matches).toBeUndefined();
  });
});
