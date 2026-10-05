import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as portalService from '../services/portal.service.js';

export const listMyInvoices = asyncHandler(async (req, res) => {
  const result = await portalService.listMyInvoices(req.resident, req.query);
  new ApiResponse(200, result, 'Invoices fetched successfully').send(res);
});

export const getMyInvoice = asyncHandler(async (req, res) => {
  const invoice = await portalService.getMyInvoiceById(req.resident, req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice fetched successfully').send(res);
});

export const listMyPayments = asyncHandler(async (req, res) => {
  const result = await portalService.listMyPayments(req.resident, req.query);
  new ApiResponse(200, result, 'Payments fetched successfully').send(res);
});

export const listMyComplaints = asyncHandler(async (req, res) => {
  const result = await portalService.listMyComplaints(req.resident, req.query);
  new ApiResponse(200, result, 'Complaints fetched successfully').send(res);
});

export const getMyComplaint = asyncHandler(async (req, res) => {
  const complaint = await portalService.getMyComplaintById(req.resident, req.params.id);
  new ApiResponse(200, { complaint }, 'Complaint fetched successfully').send(res);
});

export const submitComplaint = asyncHandler(async (req, res) => {
  const complaint = await portalService.submitMyComplaint(req.resident, req.body);
  new ApiResponse(201, { complaint }, 'Complaint submitted successfully').send(res);
});

export const listMyNotices = asyncHandler(async (req, res) => {
  const result = await portalService.listMyNotices(req.resident, req.query);
  new ApiResponse(200, result, 'Notices fetched successfully').send(res);
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const resident = await portalService.getMyProfile(req.resident);
  new ApiResponse(200, { resident }, 'Profile fetched successfully').send(res);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const resident = await portalService.updateMyProfile(req.resident, req.body);
  new ApiResponse(200, { resident }, 'Profile updated successfully').send(res);
});

export const listMyDocuments = asyncHandler(async (req, res) => {
  const documents = await portalService.listMyDocuments(req.resident);
  new ApiResponse(200, { documents }, 'Documents fetched successfully').send(res);
});

export const uploadMyDocument = asyncHandler(async (req, res) => {
  const document = await portalService.uploadMyDocument(req.resident, req.file, req.body);
  new ApiResponse(201, { document }, 'Document uploaded successfully').send(res);
});

export const deleteMyDocument = asyncHandler(async (req, res) => {
  await portalService.deleteMyDocument(req.resident, req.params.id);
  new ApiResponse(200, null, 'Document deleted successfully').send(res);
});

export const listMyMaintenanceTickets = asyncHandler(async (req, res) => {
  const result = await portalService.listMyMaintenanceTickets(req.resident, req.query);
  new ApiResponse(200, result, 'Maintenance requests fetched successfully').send(res);
});

export const getMyMaintenanceTicket = asyncHandler(async (req, res) => {
  const ticket = await portalService.getMyMaintenanceTicketById(req.resident, req.params.id);
  new ApiResponse(200, { ticket }, 'Maintenance request fetched successfully').send(res);
});

export const submitMaintenanceRequest = asyncHandler(async (req, res) => {
  const ticket = await portalService.submitMyMaintenanceRequest(req.resident, req.body);
  new ApiResponse(201, { ticket }, 'Maintenance request submitted successfully').send(res);
});

export const listMyVisitors = asyncHandler(async (req, res) => {
  const result = await portalService.listMyVisitorPreRegistrations(req.resident, req.query);
  new ApiResponse(200, result, 'Visitors fetched successfully').send(res);
});

export const preRegisterVisitor = asyncHandler(async (req, res) => {
  const visitor = await portalService.preRegisterMyVisitor(req.resident, req.body);
  new ApiResponse(201, { visitor }, 'Visitor pre-registered successfully').send(res);
});

export const cancelVisitor = asyncHandler(async (req, res) => {
  const visitor = await portalService.cancelMyVisitorPreRegistration(req.resident, req.params.id);
  new ApiResponse(200, { visitor }, 'Pre-registration cancelled').send(res);
});
