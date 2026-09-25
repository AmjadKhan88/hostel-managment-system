import { getAIProvider } from '../ai/index.js';
import { AI_TOOLS } from '../ai/tools.js';
import { AIConversation } from '../models/AIConversation.model.js';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../models/Complaint.model.js';
import { Room } from '../models/Room.model.js';
import { Bed } from '../models/Bed.model.js';
import { Building } from '../models/Building.model.js';
import { FeeStructure } from '../models/FeeStructure.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { recordAuditLog } from './audit.service.js';
import { z } from 'zod';

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
      throw ApiError.internal(`AI requested an unrecognized tool: ${name}`);
    }

    toolUsed = name;
    const toolResult = await tool.execute(user, resolvedHostelId, args ?? {});

    const followUp = await provider.complete({
      messages: [
        ...messages,
        // BUGFIX: was `firstResponse.modelParts`, which doesn't exist on
        // GeminiProvider's return shape ({ text, functionCall, raw }) and
        // evaluated to undefined — breaking every question that triggered
        // a tool call.
        { role: 'model', parts: [{ functionCall: firstResponse.functionCall }] },
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

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    // Strip accidental code fences the model sometimes adds despite instructions.
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

const NOTICE_TYPES = ['announcement', 'payment_reminder', 'maintenance', 'emergency'];

const noticeDraftSchema = z.object({
  title: z.string().min(3).max(160),
  body: z.string().min(10).max(2000),
});

/**
 * Drafts notice title/body from a short prompt. Never saved directly —
 * the frontend fills NoticeFormModal's fields with this, and the admin
 * still has to review and click Publish, per the spec's "review/edit
 * before sending" requirement.
 */
export async function generateNoticeDraft(user, hostelId, { type, prompt }) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');
  if (!NOTICE_TYPES.includes(type)) throw ApiError.badRequest('Invalid notice type');

  const provider = getAIProvider();
  if (!provider) throw ApiError.internal('No AI provider is configured');

  const instruction = `You write short hostel notices for staff to review before publishing. Write a ${type.replace(
    '_',
    ' '
  )} notice based on the request below. Respond with ONLY a JSON object of the exact shape {"title": string, "body": string} — no markdown, no explanation, no code fences.`;

  const response = await provider.complete({
    messages: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: instruction,
  });

  const parsed = parseJsonSafely(response.text);
  const result = noticeDraftSchema.safeParse(parsed);
  if (!result.success) {
    throw ApiError.internal('AI returned an unusable draft — try rephrasing your request');
  }

  recordAuditLog({
    hostelId: resolvedHostelId,
    actorId: user.id,
    action: 'ai.notice_draft_generated',
    entityType: 'Notice',
    entityId: null,
    metadata: { type, prompt },
  });

  return result.data;
}

const triageSchema = z.object({
  category: z.enum(COMPLAINT_CATEGORIES),
  priority: z.enum(COMPLAINT_PRIORITIES),
  summary: z.string().min(5).max(200),
});

/**
 * Suggests category/priority/summary for a complaint description. Never
 * saved directly — the frontend fills ComplaintFormModal's fields, and
 * staff can change any of it before submitting, per the spec's "a human
 * can change the AI suggestion" requirement.
 */
export async function triageComplaint(user, hostelId, description) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');
  if (!description || description.trim().length < 5) {
    throw ApiError.badRequest('A description is required to triage');
  }

  const provider = getAIProvider();
  if (!provider) throw ApiError.internal('No AI provider is configured');

  const instruction = `Classify this hostel maintenance/facility complaint. Valid categories: ${COMPLAINT_CATEGORIES.join(
    ', '
  )}. Valid priorities: ${COMPLAINT_PRIORITIES.join(
    ', '
  )}. Respond with ONLY a JSON object of the exact shape {"category": string, "priority": string, "summary": string} where summary is a one-sentence restatement — no markdown, no explanation, no code fences. This is a suggestion only; hostel staff will review and can change it.`;

  const response = await provider.complete({
    messages: [{ role: 'user', parts: [{ text: description }] }],
    systemInstruction: instruction,
  });

  const parsed = parseJsonSafely(response.text);
  const result = triageSchema.safeParse(parsed);
  if (!result.success) {
    throw ApiError.internal(
      'AI could not classify this complaint — please select category/priority manually'
    );
  }

  recordAuditLog({
    hostelId: resolvedHostelId,
    actorId: user.id,
    action: 'ai.complaint_triaged',
    entityType: 'Complaint',
    entityId: null,
    metadata: { suggestedCategory: result.data.category, suggestedPriority: result.data.priority },
  });

  return result.data;
}

/**
 * Suggests available rooms for a new resident. The AI never decides what
 * exists or is available — that's the deterministic query below, same as
 * every other page in the app. The AI only ranks/explains the real
 * candidate list it's handed, and is instructed to never reference
 * protected personal attributes, per the spec's non-discrimination rule.
 * If the AI call fails, the real candidate list still returns — the
 * explanation is a nice-to-have, not the source of truth.
 */
export async function suggestRooms(
  user,
  hostelId,
  { category, maxBudgetMinorUnits, minCapacity, facilities }
) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const roomFilter = { hostelId: resolvedHostelId, status: 'available' };
  if (category) roomFilter.category = category;
  if (minCapacity) roomFilter.capacity = { $gte: minCapacity };

  const candidateRooms = await Room.find(roomFilter).limit(20);

  const candidates = [];
  for (const room of candidateRooms) {
    const availableBeds = await Bed.countDocuments({ roomId: room._id, status: 'available' });
    if (availableBeds === 0) continue;

    // Budget is checked against a matching fee structure if one exists for
    // this room's category; rooms with no matching fee structure are still
    // included (budget just isn't checked for them) rather than silently
    // dropped.
    let matchesBudget = true;
    if (maxBudgetMinorUnits) {
      const fee = await FeeStructure.findOne({
        hostelId: resolvedHostelId,
        roomCategory: room.category,
        feeType: 'rent',
        isActive: true,
      });
      if (fee) matchesBudget = fee.amountMinorUnits <= maxBudgetMinorUnits;
    }
    if (!matchesBudget) continue;

    const building = await Building.findById(room.buildingId);

    candidates.push({
      roomId: room._id,
      buildingId: room.buildingId,
      roomNumber: room.roomNumber,
      category: room.category,
      capacity: room.capacity,
      amenities: room.amenities,
      availableBeds,
      buildingName: building?.name ?? 'Unknown',
    });
  }

  if (candidates.length === 0) {
    return { candidates: [], explanation: 'No available rooms currently match these constraints.' };
  }

  let explanation = null;
  const provider = getAIProvider();

  if (provider) {
    const instruction = `You help hostel staff choose between available rooms for a new resident. You are given a JSON list of real, currently-available candidate rooms and the staff member's stated preferences. Recommend the best 1-3 options and briefly explain why, referencing room numbers from the list. Do not invent rooms, amenities, or numbers not present in the list. Never factor in or mention any protected personal attribute (race, religion, gender, disability, etc.) — base recommendations only on room/operational fit. Keep the response under 120 words.`;

    const prompt = `Preferences: ${JSON.stringify({ category, maxBudgetMinorUnits, minCapacity, facilities })}\n\nAvailable candidates: ${JSON.stringify(candidates)}`;

    try {
      const response = await provider.complete({
        messages: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: instruction,
      });
      explanation = response.text;
    } catch {
      explanation = null;
    }
  }

  recordAuditLog({
    hostelId: resolvedHostelId,
    actorId: user.id,
    action: 'ai.room_suggestion',
    entityType: 'Room',
    entityId: null,
    metadata: { category, maxBudgetMinorUnits, minCapacity, candidateCount: candidates.length },
  });

  return { candidates, explanation };
}
