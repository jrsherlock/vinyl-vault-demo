import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import * as tools from '@/lib/tools';

console.log('Env Check:', {
  hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
  hasKey: !!process.env.AZURE_OPENAI_API_KEY,
  hasDeployment: !!process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
});

export async function POST(req: Request) {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
    const client = new AzureOpenAI({
      endpoint: endpoint?.endsWith('/') ? endpoint.slice(0, -1) : endpoint,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    });

    const { messages } = await req.json();
    
    // Read system prompt from file
    const systemPromptPath = path.join(process.cwd(), 'src/lib/ai/system-prompt.txt');
    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');

    // Ensure the message sequence is valid for OpenAI (System -> User -> Assistant ...)
    // Filter out any messages that don't satisfy the sequence or are just the initial bot greeting.
    let validMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // If the first message is from assistant, it's just the greeting, we can skip it for the LLM's context 
    // since the model should start fresh with the system prompt instructions.
    if (validMessages.length > 0 && validMessages[0].role === 'assistant') {
      validMessages = validMessages.slice(1);
    }

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...validMessages
    ];

    // Call Azure OpenAI with tools
    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      messages: formattedMessages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'lookup_product',
            description: 'Search the vinyl record product database',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Artist, title, or genre to search for' }
              },
              required: ['query']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'lookup_order',
            description: 'Look up an order by its ID',
            parameters: {
              type: 'object',
              properties: {
                order_id: { type: 'string', description: 'The order ID (e.g., ORD-2024-001)' }
              },
              required: ['order_id']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'lookup_customer',
            description: 'Get customer information by email or ID',
            parameters: {
              type: 'object',
              properties: {
                email_or_id: { type: 'string', description: 'Customer email or ID' }
              },
              required: ['email_or_id']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'apply_discount',
            description: 'Apply a discount code to a cart',
            parameters: {
              type: 'object',
              properties: {
                cart_id: { type: 'string' },
                code: { type: 'string' }
              },
              required: ['cart_id', 'code']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'issue_refund',
            description: 'Process a refund for an order',
            parameters: {
              type: 'object',
              properties: {
                order_id: { type: 'string' },
                amount: { type: 'number' }
              },
              required: ['order_id', 'amount']
            }
          }
        }
      ],
      tool_choice: 'auto',
    });

    const assistantMessage = response.choices[0].message;

    // Handle tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolMessages = [...formattedMessages, assistantMessage];

      for (const toolCall of assistantMessage.tool_calls as any[]) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        // Execute tool with named arguments
        let toolResult;
        const toolFn = (tools as any)[toolName];
        
        if (toolName === 'lookup_product') toolResult = await toolFn(toolArgs.query);
        else if (toolName === 'lookup_order') toolResult = await toolFn(toolArgs.order_id);
        else if (toolName === 'lookup_customer') toolResult = await toolFn(toolArgs.email_or_id);
        else if (toolName === 'apply_discount') toolResult = await toolFn(toolArgs.cart_id, toolArgs.code);
        else if (toolName === 'issue_refund') toolResult = await toolFn(toolArgs.order_id, toolArgs.amount);
        else toolResult = { error: 'Unknown tool' };
        
        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        } as any);
      }
      
      // Get final response after tool execution
      const secondResponse = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
        messages: toolMessages,
      });
      
      return NextResponse.json({ 
        response: secondResponse.choices[0].message.content
      });
    }

    return NextResponse.json({ 
      response: assistantMessage.content
    });

  } catch (error: any) {
    console.error('Chat API Error Details:', error);
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
    }
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error.message 
    }, { status: 500 });
  }
}
