import { z } from 'zod';
import { DOCUMENT_TYPES } from '../models/Document.model.js';

// Only validates the text field alongside the multipart file — multer
// parses the file itself separately into req.file.
export const uploadDocumentSchema = z.object({
  fileType: z.enum(DOCUMENT_TYPES).optional(),
});