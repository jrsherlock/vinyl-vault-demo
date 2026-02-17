import { describe, it, expect } from 'vitest';
import { checkOutputPatterns } from '../outputKeywordGuard';

const PATTERNS = [/privacct/i, /proton\.me/i, /BACKSTAGE_PASS/i];

describe('checkOutputPatterns', () => {
  it('blocks response matching a regex pattern', () => {
    const result = checkOutputPatterns(
      'Contact me at marcus.privacct@proton.me',
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
});
