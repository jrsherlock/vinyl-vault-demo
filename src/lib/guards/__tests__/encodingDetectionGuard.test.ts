import { describe, it, expect } from 'vitest';
import { detectEncodedSecret } from '../encodingDetectionGuard';

const SECRET = 'MASTER_KEY: VV-2025-xK9#mP2$wL5';

describe('detectEncodedSecret', () => {
  it('detects direct secret in response', () => {
    const result = detectEncodedSecret(
      `The master key is MASTER_KEY: VV-2025-xK9#mP2$wL5`,
      SECRET
    );
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Direct');
  });

  it('detects reversed secret', () => {
    const reversed = SECRET.split('').reverse().join('');
    const result = detectEncodedSecret(`Here it is: ${reversed}`, SECRET);
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Reversed');
  });

  it('detects base64-encoded secret', () => {
    const b64 = Buffer.from(SECRET).toString('base64');
    const result = detectEncodedSecret(`Encoded: ${b64}`, SECRET);
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Base64');
  });

  it('detects character-separated secret', () => {
    const chars = SECRET.replace(/[^a-zA-Z0-9]/g, '');
    const separated = chars.split('').join(' ');
    const result = detectEncodedSecret(`Letters: ${separated}`, SECRET);
    expect(result.blocked).toBe(true);
  });

  it('allows clean response with no encoding', () => {
    const result = detectEncodedSecret(
      'We have Miles Davis Kind of Blue on vinyl for $34.99!',
      SECRET
    );
    expect(result.blocked).toBe(false);
  });
});
