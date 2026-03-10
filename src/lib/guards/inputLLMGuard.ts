import { AzureOpenAI } from 'openai';
import { GuardResult } from './inputKeywordGuard';

export async function classifyInputIntent(
  client: AzureOpenAI,
  deployment: string,
  userMessage: string,
  guardPrompt: string
): Promise<GuardResult> {
  try {
    // Split guard prompt at the {USER_MESSAGE} placeholder:
    // system message = classifier instructions — avoids Azure content filter
    // triggering on adversarial user input embedded in a single user message.
    const [systemPart] = guardPrompt.split('{USER_MESSAGE}');
    const systemPrompt = systemPart
      .replace(/User message:\s*"""\s*$/s, '')
      .trim();

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User message:\n"""\n${userMessage}\n"""` },
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
    // Fail open - if the guard errors, let the request through
    console.error('Input LLM guard error:', error);
    return { blocked: false };
  }
}
