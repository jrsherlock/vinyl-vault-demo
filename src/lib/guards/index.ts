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
        message: `🔒 **[SESSION BLOCKED]** ${result.reason}`,
      };
    }
  }

  // 1. Input keyword guard
  if (config.inputKeywords) {
    const result = checkInputKeywords(userMessage, config.inputKeywords);
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'input_keyword',
        message: config.blockedMessages.inputKeyword,
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
  // 1. Output keyword guard
  if (config.outputPatterns) {
    const result = checkOutputPatterns(llmResponse, config.outputPatterns);
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'output_keyword',
        message: config.blockedMessages.outputKeyword,
      };
    }
  }

  // 2. Output LLM guard
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

  // 3. Encoding detection guard
  if (config.encodingDetection) {
    const result = detectEncodedSecret(llmResponse, config.secret);
    if (result.blocked) {
      return {
        blocked: true,
        guardType: 'encoding_detection',
        message: '🔐 **[ENCODING DETECTED]** Vinnie\'s response contained an encoded version of restricted data. Nice try — but we check for that too!',
      };
    }
  }

  return { blocked: false };
}

export function recordGuardFlag(sessionId: string): void {
  recordSessionFlag(sessionId);
}

export { getLevelConfig };
