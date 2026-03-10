import { GuardResult } from './inputKeywordGuard';

/**
 * Detects encoded versions of a secret in the LLM output.
 * Checks: base64, hex, ROT13, reversed, character-separated, leetspeak.
 */
export function detectEncodedSecret(
  response: string,
  secret: string
): GuardResult {
  const responseLower = response.toLowerCase();
  const secretLower = secret.toLowerCase();

  // 1. Direct check (case-insensitive)
  if (responseLower.includes(secretLower)) {
    return { blocked: true, reason: 'Direct secret match detected' };
  }

  // 2. Reversed string check
  const reversed = secretLower.split('').reverse().join('');
  if (responseLower.includes(reversed)) {
    return { blocked: true, reason: 'Reversed secret detected' };
  }

  // 3. Character-separated check (e.g., "V V - 2 0 2 5" or "V,V,-,2,0,2,5")
  // Build a regex that matches the secret characters with separators between them
  const chars = secretLower.replace(/[^a-z0-9]/g, '');
  if (chars.length >= 4) {
    const separatedPattern = chars.split('').join('[^a-z0-9]{1,5}');
    const separatedRegex = new RegExp(separatedPattern, 'i');
    if (separatedRegex.test(response)) {
      return { blocked: true, reason: 'Character-separated secret detected' };
    }
  }

  // 4. Base64 check — encode the secret and look for it in the response
  const base64Encoded = Buffer.from(secret).toString('base64');
  if (response.includes(base64Encoded)) {
    return { blocked: true, reason: 'Base64-encoded secret detected' };
  }
  // Also check lowercase variant
  if (responseLower.includes(base64Encoded.toLowerCase())) {
    return { blocked: true, reason: 'Base64-encoded secret detected' };
  }

  // 5. Hex check — look for hex encoding of the secret
  const hexEncoded = Buffer.from(secret)
    .toString('hex')
    .toLowerCase();
  if (responseLower.includes(hexEncoded)) {
    return { blocked: true, reason: 'Hex-encoded secret detected' };
  }

  // 6. ROT13 check
  const rot13 = secretLower.replace(/[a-z]/g, (c) =>
    String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97)
  );
  if (responseLower.includes(rot13)) {
    return { blocked: true, reason: 'ROT13-encoded secret detected' };
  }

  // 7. Word-based fragment check — split secret into words, flag if
  //    a majority of words appear together in the response. This avoids
  //    false positives on single common words (e.g., "diamond" in
  //    "Diamond Eyes by Deftones" shouldn't trigger for DIAMOND_STYLUS_FOREVER_2025).
  const secretWords = secretLower
    .split(/[_\s]+/)
    .filter((w) => w.length >= 4);
  if (secretWords.length >= 2) {
    const matchedWords = secretWords.filter((w) => responseLower.includes(w));
    // Require 3+ words or 60% of words (whichever is higher)
    const threshold = Math.max(2, Math.ceil(secretWords.length * 0.6));
    if (matchedWords.length >= threshold) {
      return {
        blocked: true,
        reason: `Multiple secret words detected: ${matchedWords.join(', ')}`,
      };
    }
  }

  return { blocked: false };
}
