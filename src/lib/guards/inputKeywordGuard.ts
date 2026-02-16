export interface GuardResult {
  blocked: boolean;
  reason?: string;
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
    };
  }

  return { blocked: false };
}
