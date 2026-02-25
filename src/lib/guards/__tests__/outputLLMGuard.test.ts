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
    const client = mockClient('BLOCKED Response contains the vendor passphrase');
    const result = await classifyOutputLeak(
      client,
      'gpt-4o-mini',
      'The passphrase is NEEDLE_DROP_PHOENIX_RISING',
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
