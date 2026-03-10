import { AzureOpenAI } from 'openai';
import { GuardResult } from './inputKeywordGuard';

export async function classifyOutputLeak(
  client: AzureOpenAI,
  deployment: string,
  llmResponse: string,
  guardPrompt: string
): Promise<GuardResult> {
  try {
    // Split guard prompt at the {RESPONSE} placeholder:
    // system message = instructions (incl. secret) — Azure content filter is
    // more permissive on system prompts, avoiding false 400s.
    // user message = the actual response to analyze.
    const [systemPart] = guardPrompt.split('{RESPONSE}');
    const systemPrompt = systemPart
      .replace(/Response to analyze:\s*"""\s*$/, '')
      .trim();

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Response to analyze:\n"""\n${llmResponse}\n"""` },
      ],
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
