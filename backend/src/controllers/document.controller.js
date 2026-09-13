import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as documentService from '../services/document.service.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  const document = await documentService.uploadDocument(req.user, req.params.residentId, req.file, req.body);
  new ApiResponse(201, { document }, 'Document uploaded successfully').send(res);
});

export const listDocuments = asyncHandler(async (req, res) => {
  const documents = await documentService.listDocumentsForResident(req.user, req.params.residentId);
  new ApiResponse(200, { documents }, 'Documents fetched successfully').send(res);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.user, req.params.residentId, req.params.id);
  new ApiResponse(200, null, 'Document deleted successfully').send(res);
});