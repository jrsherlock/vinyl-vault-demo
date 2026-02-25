import { GuardResult } from './inputKeywordGuard';

export function checkOutputPatterns(
  response: string,
  patterns: RegExp[]
): GuardResult {
  const allMatches: Array<{ matchText: string; index: number }> = [];

  for (const pattern of patterns) {
    // Create a global version of the pattern to find all occurrences
    const globalPattern = new RegExp(
      pattern.source,
      pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
    );
    let match: RegExpExecArray | null;
    while ((match = globalPattern.exec(response)) !== null) {
      allMatches.push({
        matchText: match[0],
        index: match.index,
      });
    }
  }

  if (allMatches.length > 0) {
    return {
      blocked: true,
      reason: 'Response matched restricted output pattern',
      matches: allMatches,
    };
  }

  return { blocked: false };
}
