export interface GuardResult {
  blocked: boolean;
  reason?: string;
  matches?: Array<{ matchText: string; index: number }>;
  matchedKeyword?: string;
}

export function checkInputKeywords(
  userMessage: string,
  keywords: string[]
): GuardResult {
  const inputLower = userMessage.toLowerCase();
  const matched = keywords.find((kw) => inputLower.includes(kw.toLowerCase()));

  if (matched) {
    return {
      blocked: true,
      reason: `Input contained restricted keyword pattern`,
      matchedKeyword: matched,
    };
  }

  return { blocked: false };
}
