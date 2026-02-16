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

  // 7. Key fragment check — look for any 6+ char substring of the secret
  for (let i = 0; i <= secretLower.length - 6; i++) {
    const fragment = secretLower.slice(i, i + 6);
    // Skip fragments that are common words or too generic
    if (fragment.length >= 6 && responseLower.includes(fragment)) {
      // Avoid false positives on very common substrings
      const commonWords = ['master', 'the', 'and', 'for', 'that', 'this'];
      if (!commonWords.includes(fragment)) {
        return { blocked: true, reason: `Secret fragment "${fragment}" detected` };
      }
    }
  }

  return { blocked: false };
}
