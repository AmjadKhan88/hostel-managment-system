import { getAIProvider } from '../ai/index.js';
import { AI_TOOLS } from '../ai/tools.js';
import { AIConversation } from '../models/AIConversation.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { recordAuditLog } from './audit.service.js';

const SYSTEM_INSTRUCTION = `You are the admin assistant for a Hostel Management System. You help hostel staff answer questions about occupancy, residents, fees, complaints, and maintenance using ONLY the tool functions provided — never invent numbers or facts. If a question needs data you don't have a tool for, say so honestly rather than guessing. Keep answers concise and factual, and always report numbers exactly as returned by the tools, never rounded or estimated.`;

function toGeminiToolDeclarations() {
  return Object.entries(AI_TOOLS).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(tool.parameters).map(([key, spec]) => [
          key,
          {
            type: spec.type,
            description: spec.description,
            ...(spec.enum ? { enum: spec.enum } : {}),
          },
        ])
      ),
    },
  }));
}

export async function askAdminAssistant(user, hostelId, question) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');
  if (!question || question.trim().length === 0)
    throw ApiError.badRequest('A question is required');

  const provider = getAIProvider();
  if (!provider) {
    throw ApiError.internal('No AI provider is configured (set AI_PROVIDER in the backend .env)');
  }

  const tools = toGeminiToolDeclarations();
  const messages = [{ role: 'user', parts: [{ text: question }] }];

  const firstResponse = await provider.complete({
    messages,
    tools,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  let finalText = firstResponse.text;
  let toolUsed = null;

  if (firstResponse.functionCall) {
    const { name, args } = firstResponse.functionCall;
    const tool = AI_TOOLS[name];

    if (!tool) {
      // Defense in depth: refuse to execute anything outside the declared
      // list, even if the model somehow names something else.
      throw ApiError.internal(`AI requested an unrecognized tool: ${name}`);
    }

    toolUsed = name;
    const toolResult = await tool.execute(user, resolvedHostelId, args ?? {});

    const followUp = await provider.complete({
      messages: [
        ...messages,
        { role: 'model', parts: firstResponse.modelParts },
        { role: 'user', parts: [{ functionResponse: { name, response: toolResult } }] },
      ],
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    finalText = followUp.text;
  }

  if (!finalText) {
    finalText = "I wasn't able to generate an answer for that — try rephrasing the question.";
  }

  const conversation = await AIConversation.create({
    hostelId: resolvedHostelId,
    userId: user.id,
    question: question.trim(),
    answer: finalText,
    toolUsed,
  });

  recordAuditLog({
    hostelId: resolvedHostelId,
    actorId: user.id,
    action: 'ai.assistant_query',
    entityType: 'AIConversation',
    entityId: conversation._id,
    metadata: { question: question.trim(), toolUsed },
  });

  return { answer: finalText, toolUsed };
}

export async function listConversationHistory(user, hostelId) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  return AIConversation.find({ hostelId: resolvedHostelId, userId: user.id })
    .sort({ createdAt: -1 })
    .limit(20);
}
