import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as aiAssistantService from '../services/aiAssistant.service.js';

export const ask = asyncHandler(async (req, res) => {
  const result = await aiAssistantService.askAdminAssistant(
    req.user,
    req.body.hostelId,
    req.body.question
  );
  new ApiResponse(200, result, 'Assistant responded successfully').send(res);
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await aiAssistantService.listConversationHistory(req.user, req.query.hostelId);
  new ApiResponse(200, { history }, 'Conversation history fetched successfully').send(res);
});

export const generateNoticeDraft = asyncHandler(async (req, res) => {
  const draft = await aiAssistantService.generateNoticeDraft(req.user, req.body.hostelId, req.body);
  new ApiResponse(200, { draft }, 'Notice draft generated successfully').send(res);
});

export const triageComplaint = asyncHandler(async (req, res) => {
  const suggestion = await aiAssistantService.triageComplaint(
    req.user,
    req.body.hostelId,
    req.body.description
  );
  new ApiResponse(200, { suggestion }, 'Complaint triaged successfully').send(res);
});
