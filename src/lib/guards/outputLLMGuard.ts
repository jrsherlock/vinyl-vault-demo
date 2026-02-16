import { AzureOpenAI } from 'openai';
import { GuardResult } from './inputKeywordGuard';

export async function classifyOutputLeak(
  client: AzureOpenAI,
  deployment: string,
  llmResponse: string,
  guardPrompt: string
): Promise<GuardResult> {
  try {
    const prompt = guardPrompt.replace('{RESPONSE}', llmResponse);

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0,
    });

    const result = response.choices[0]?.message?.content?.trim() || '';
    const isBlocked = result.toUpperCase().startsWith('BLOCKED');

    return {
      blocked: isBlocked,
      reason: isBlocked ? result : undefined,
    };
  } catch (error) {
    // Fail open - if the guard errors, let the response through
    console.error('Output LLM guard error:', error);
    return { blocked: false };
  }
}
