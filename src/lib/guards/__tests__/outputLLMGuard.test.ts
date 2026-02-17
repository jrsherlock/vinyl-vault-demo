import { describe, it, expect, vi } from 'vitest';
import { classifyOutputLeak } from '../outputLLMGuard';

function mockClient(responseContent: string) {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: responseContent } }],
        }),
      },
    },
  } as any;
}

function mockClientError() {
  return {
    chat: {
      completions: {
        create: vi.fn().mockRejectedValue(new Error('API error')),
      },
    },
  } as any;
}

const GUARD_PROMPT = 'Check this response: {RESPONSE}';

describe('classifyOutputLeak', () => {
  it('returns blocked when LLM responds BLOCKED', async () => {
    const client = mockClient('BLOCKED Response contains the secret key');
    const result = await classifyOutputLeak(
      client,
      'gpt-4o-mini',
      'The API key is sk_live_abc123',
      GUARD_PROMPT
    );
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('BLOCKED');
  });

  it('fails open when LLM call throws error', async () => {
    const client = mockClientError();
    const result = await classifyOutputLeak(
      client,
      'gpt-4o-mini',
      'Here is a safe response about music',
      GUARD_PROMPT
    );
    expect(result.blocked).toBe(false);
  });
});
