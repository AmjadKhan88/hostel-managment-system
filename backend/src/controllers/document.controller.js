import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as documentService from '../services/document.service.js';
import * as documentExport from '../services/documentExport.service.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  const document = await documentService.uploadDocument(
    req.user,
    req.params.residentId,
    req.file,
    req.body
  );
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

function sendPdf(res, { buffer, filename }) {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': `attachment; filename="${filename}"`,
    // Personal financial documents — never cache them in a shared proxy.
    'Cache-Control': 'private, no-store',
  });
  res.send(buffer);
}

export const staffInvoicePdf = asyncHandler(async (req, res) =>
  sendPdf(res, await documentExport.invoicePdfForStaff(req.user, req.params.id))
);

export const staffReceiptPdf = asyncHandler(async (req, res) =>
  sendPdf(res, await documentExport.receiptPdfForStaff(req.user, req.params.id))
);

export const residentInvoicePdf = asyncHandler(async (req, res) =>
  sendPdf(res, await documentExport.invoicePdfForResident(req.resident, req.params.id))
);

export const residentReceiptPdf = asyncHandler(async (req, res) =>
  sendPdf(res, await documentExport.receiptPdfForResident(req.resident, req.params.id))
);
