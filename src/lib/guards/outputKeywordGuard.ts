import { GuardResult } from './inputKeywordGuard';

export function checkOutputPatterns(
  response: string,
  patterns: RegExp[]
): GuardResult {
  const matched = patterns.find((pattern) => pattern.test(response));

  if (matched) {
    return {
      blocked: true,
      reason: `Response matched restricted output pattern`,
    };
  }

  return { blocked: false };
}
