import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import * as tools from '@/lib/tools';
import { cookies } from 'next/headers';
import { getLevelConfig, runInputGuards, runOutputGuards, recordGuardFlag } from '@/lib/guards';

const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'lookup_product',
      description: 'Search the vinyl record product database',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Artist, title, or genre to search for' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_order',
      description: 'Look up an order by its ID',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'string', description: 'The order ID (e.g., ORD-2024-001)' },
        },
        required: ['order_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_customer',
      description: 'Get customer information by email or ID',
      parameters: {
        type: 'object',
        properties: {
          email_or_id: { type: 'string', description: 'Customer email or ID' },
        },
        required: ['email_or_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'apply_discount',
      description: 'Apply a discount code to a cart',
      parameters: {
        type: 'object',
        properties: {
          cart_id: { type: 'string' },
          code: { type: 'string' },
        },
        required: ['cart_id', 'code'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'issue_refund',
      description: 'Process a refund for an order',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'string' },
          amount: { type: 'number' },
        },
        required: ['order_id', 'amount'],
      },
    },
  },
];

export async function POST(req: Request) {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    const client = new AzureOpenAI({
      endpoint: endpoint?.endsWith('/') ? endpoint.slice(0, -1) : endpoint,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: deployment,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    });

    const { messages, level = 1 } = await req.json();

    // Validate level
    const gameLevel = Math.max(1, Math.min(6, Number(level) || 1));
    const config = getLevelConfig(gameLevel);

    // Load level-specific system prompt
    const systemPromptPath = path.join(
      process.cwd(),
      'src/lib/ai/prompts',
      config.promptFile
    );
    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');

    // Session tracking for adaptive guards
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('vv_session')?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Get the latest user message for guard checks
    const lastUserMessage =
      messages
        .slice()
        .reverse()
        .find((m: any) => m.role === 'user')?.content || '';

    // === INPUT GUARDS ===
    const inputGuardResult = await runInputGuards(
      client,
      deployment,
      lastUserMessage,
      config,
      sessionId
    );
    if (inputGuardResult.blocked) {
      if (gameLevel === 6) recordGuardFlag(sessionId);
      const resp = NextResponse.json({
        response: inputGuardResult.message,
        blocked: true,
        guardType: inputGuardResult.guardType,
      });
      resp.cookies.set('vv_session', sessionId, {
        httpOnly: true,
        maxAge: 60 * 60,
        sameSite: 'lax',
      });
      return resp;
    }

    // === PRIMARY LLM CALL ===
    // Prepare messages for the LLM
    let validMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Skip initial assistant greeting
    if (validMessages.length > 0 && validMessages[0].role === 'assistant') {
      validMessages = validMessages.slice(1);
    }

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...validMessages,
    ];

    const response = await client.chat.completions.create({
      model: deployment,
      messages: formattedMessages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
    });

    let assistantMessage = response.choices[0].message;
    let finalContent = assistantMessage.content || '';
    let usage = response.usage;

    // Handle tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolMessages = [...formattedMessages, assistantMessage];

      for (const toolCall of assistantMessage.tool_calls as any[]) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        let toolResult;
        if (toolName === 'lookup_product')
          toolResult = await (tools as any)[toolName](toolArgs.query);
        else if (toolName === 'lookup_order')
          toolResult = await (tools as any)[toolName](toolArgs.order_id);
        else if (toolName === 'lookup_customer')
          toolResult = await (tools as any)[toolName](toolArgs.email_or_id);
        else if (toolName === 'apply_discount')
          toolResult = await (tools as any)[toolName](
            toolArgs.cart_id,
            toolArgs.code
          );
        else if (toolName === 'issue_refund')
          toolResult = await (tools as any)[toolName](
            toolArgs.order_id,
            toolArgs.amount
          );
        else toolResult = { error: 'Unknown tool' };

        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        } as any);
      }

      const secondResponse = await client.chat.completions.create({
        model: deployment,
        messages: toolMessages,
      });

      finalContent = secondResponse.choices[0].message.content || '';
      usage = secondResponse.usage;
    }

    // Capture raw answer for telemetry before output guards
    const rawAnswer = finalContent;

    // === OUTPUT GUARDS ===
    const outputGuardResult = await runOutputGuards(
      client,
      deployment,
      finalContent,
      config
    );
    if (outputGuardResult.blocked) {
      if (gameLevel === 6) recordGuardFlag(sessionId);
      const resp = NextResponse.json({
        response: outputGuardResult.message,
        blocked: true,
        guardType: outputGuardResult.guardType,
        rawAnswerLength: rawAnswer.length,
        usage: usage,
      });
      resp.cookies.set('vv_session', sessionId, {
        httpOnly: true,
        maxAge: 60 * 60,
        sameSite: 'lax',
      });
      return resp;
    }

    // Return clean response
    const resp = NextResponse.json({
      response: finalContent,
      usage: usage,
    });
    resp.cookies.set('vv_session', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60,
      sameSite: 'lax',
    });
    return resp;
  } catch (error: any) {
    console.error('Chat API Error Details:', error);
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
    }
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
