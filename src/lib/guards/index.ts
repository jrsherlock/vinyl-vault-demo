import { AzureOpenAI } from 'openai';
import { getLevelConfig, LevelConfig } from './levelConfig';
import { checkInputKeywords } from './inputKeywordGuard';
import { checkOutputPatterns } from './outputKeywordGuard';
import { classifyInputIntent } from './inputLLMGuard';
import { classifyOutputLeak } from './outputLLMGuard';
import { checkAdaptiveSession, recordSessionFlag } from './adaptiveSessionGuard';
import { detectEncodedSecret } from './encodingDetectionGuard';

export interface GuardPipelineResult {
  blocked: boolean;
  guardType?: 'input_keyword' | 'input_llm' | 'output_keyword' | 'output_llm' | 'adaptive_session' | 'encoding_detection';
  message?: string;
  redactedResponse?: string;
}

/**
 * Replace matched substrings with Unicode full-block characters (█).
 * Processes matches from end to start so earlier indices stay valid.
 */
function redactMatches(
  text: string,
  matches: Array<{ matchText: string; index: number }>
): string {
  const sorted = [...matches].sort((a, b) => b.index - a.index);
  let result = text;
  for (const m of sorted) {
    const blocks = '\u2588'.repeat(m.matchText.length);
    result = result.slice(0, m.index) + blocks + result.slice(m.index + m.matchText.length);
  }
  return result;
}

export async function runInputGuards(
  client: AzureOpenAI,
  deployment: string,
  userMessage: string,
  config: LevelConfig,
  sessionId?: string
): Promise<GuardPipelineResult> {
  // 0. Adaptive session guard (check cooldown first)
  if (config.adaptiveSession && sessionId) {
    const result = checkAdaptiveSession(sessionId);
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'adaptive_session',
        message: `\uD83D\uDD12 **[SESSION BLOCKED]** ${result.reason}`,
      };
    }
  }

  // 1. Input keyword guard
  if (config.inputKeywords) {
    const result = checkInputKeywords(userMessage, config.inputKeywords);
    if (result.blocked) {
      let message = config.blockedMessages.inputKeyword;
      if (result.matchedKeyword) {
        message = message.replace('{KEYWORD}', result.matchedKeyword);
      }
      return {
        blocked: true,
        guardType: 'input_keyword',
        message,
      };
    }
  }

  // 2. Input LLM guard
  if (config.inputLLMGuard && config.inputLLMGuardPrompt) {
    const result = await classifyInputIntent(
      client,
      deployment,
      userMessage,
      config.inputLLMGuardPrompt
    );
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'input_llm',
        message: config.blockedMessages.inputLLM,
      };
    }
  }

  return { blocked: false };
}

export async function runOutputGuards(
  client: AzureOpenAI,
  deployment: string,
  llmResponse: string,
  config: LevelConfig
): Promise<GuardPipelineResult> {
  // 1. Output keyword guard — redacts rather than suppresses
  if (config.outputPatterns) {
    const result = checkOutputPatterns(llmResponse, config.outputPatterns);
    if (result.blocked && result.matches) {
      return {
        blocked: true,
        guardType: 'output_keyword',
        message: config.blockedMessages.outputKeyword,
        redactedResponse: redactMatches(llmResponse, result.matches),
      };
    }
  }

  // 2. Output LLM guard — full block (no redaction)
  if (config.outputLLMGuard && config.outputLLMGuardPrompt) {
    const result = await classifyOutputLeak(
      client,
      deployment,
      llmResponse,
      config.outputLLMGuardPrompt
    );
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'output_llm',
        message: config.blockedMessages.outputLLM,
      };
    }
  }

  // 3. Encoding detection guard — full block
  if (config.encodingDetection) {
    const result = detectEncodedSecret(llmResponse, config.secret);
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'encoding_detection',
        message: '\uD83D\uDD10 **[ENCODING DETECTED]** Vinnie\'s response contained an encoded version of restricted data. Nice try \u2014 but we check for that too!',
      };
    }
  }

  return { blocked: false };
}

export function recordGuardFlag(sessionId: string): void {
  recordSessionFlag(sessionId);
}

export { getLevelConfig };
