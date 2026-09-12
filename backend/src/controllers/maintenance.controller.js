import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as maintenanceService from '../services/maintenance.service.js';

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await maintenanceService.createTicket(req.user, req.body);
  new ApiResponse(201, { ticket }, 'Maintenance ticket created successfully').send(res);
});

export const listTickets = asyncHandler(async (req, res) => {
  const result = await maintenanceService.listTickets(req.user, req.query);
  new ApiResponse(200, result, 'Maintenance tickets fetched successfully').send(res);
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await maintenanceService.getTicketById(req.user, req.params.id);
  new ApiResponse(200, { ticket }, 'Maintenance ticket fetched successfully').send(res);
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await maintenanceService.updateTicket(req.user, req.params.id, req.body);
  new ApiResponse(200, { ticket }, 'Maintenance ticket updated successfully').send(res);
});