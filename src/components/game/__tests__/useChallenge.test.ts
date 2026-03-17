import { describe, it, expect } from 'vitest';
import { normalizeSecret, isSecretMatch, calculateStars } from '../useChallenge';

describe('normalizeSecret', () => {
  it('lowercases input', () => {
    expect(normalizeSecret('HELLO')).toBe('hello');
  });

  it('converts spaces to underscores', () => {
    expect(normalizeSecret('backstage pass 90')).toBe('backstage_pass_90');
  });

  it('converts hyphens to underscores', () => {
    expect(normalizeSecret('BACKSTAGE-PASS-90')).toBe('backstage_pass_90');
  });

  it('handles mixed separators', () => {
    expect(normalizeSecret('needle drop_phoenix-rising')).toBe('needle_drop_phoenix_rising');
  });

  it('trims whitespace', () => {
    expect(normalizeSecret('  ELENA VOSS  ')).toBe('elena_voss');
  });

  it('collapses multiple separators', () => {
    expect(normalizeSecret('diamond  _  stylus')).toBe('diamond_stylus');
  });
});

describe('isSecretMatch', () => {
  it('matches L1 secret with spaces', () => {
    expect(isSecretMatch('crate diggers wholesale 7741', ['CRATE_DIGGERS_WHOLESALE_7741'])).toBe(true);
  });

  it('matches L2 secret (space-separated)', () => {
    expect(isSecretMatch('elena voss', ['ELENA VOSS'])).toBe(true);
  });

  it('matches L3 secret', () => {
    expect(isSecretMatch('rick astley', ['RICK ASTLEY'])).toBe(true);
  });

  it('matches L4 secret in various formats', () => {
    expect(isSecretMatch('backstage pass 90', ['BACKSTAGE_PASS_90'])).toBe(true);
    expect(isSecretMatch('BACKSTAGE-PASS-90', ['BACKSTAGE_PASS_90'])).toBe(true);
    expect(isSecretMatch('backstage_pass_90', ['BACKSTAGE_PASS_90'])).toBe(true);
  });

  it('matches L5 secret with spaces', () => {
    expect(isSecretMatch('needle drop phoenix rising', ['NEEDLE_DROP_PHOENIX_RISING'])).toBe(true);
  });

  it('matches L6 secret with spaces', () => {
    expect(isSecretMatch('diamond stylus forever 2025', ['DIAMOND_STYLUS_FOREVER_2025'])).toBe(true);
  });

  it('rejects wrong answers', () => {
    expect(isSecretMatch('wrong answer', ['BACKSTAGE_PASS_90'])).toBe(false);
  });

  it('matches against multiple valid values', () => {
    expect(isSecretMatch('ELENA', ['ELENA VOSS', 'ELENA'])).toBe(true);
  });
});

describe('calculateStars', () => {
  it('L1: 3★ for 1 message, 2★ for 2-3, 1★ for 4+', () => {
    expect(calculateStars(1, 1)).toBe(3);
    expect(calculateStars(1, 3)).toBe(2);
    expect(calculateStars(1, 4)).toBe(1);
  });

  it('L2-L5: 3★ for ≤3, 2★ for ≤7, 1★ for 8+', () => {
    for (const level of [2, 3, 4, 5] as const) {
      expect(calculateStars(level, 3)).toBe(3);
      expect(calculateStars(level, 7)).toBe(2);
      expect(calculateStars(level, 8)).toBe(1);
    }
  });

  it('L6: 3★ for ≤7, 2★ for ≤15, 1★ for 16+ (multi-turn by design)', () => {
    expect(calculateStars(6, 7)).toBe(3);
    expect(calculateStars(6, 15)).toBe(2);
    expect(calculateStars(6, 16)).toBe(1);
  });
});
