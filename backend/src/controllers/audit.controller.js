import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as auditService from '../services/audit.service.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.listAuditLogs(req.user, req.query);
  new ApiResponse(200, result, 'Audit logs fetched successfully').send(res);
});