import { z } from 'zod';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../models/Complaint.model.js';
import { DOCUMENT_TYPES } from '../models/Document.model.js';

export const submitComplaintSchema = z.object({
  subject: z.string().min(3).max(160),
  description: z.string().min(5).max(3000),
  category: z.enum(COMPLAINT_CATEGORIES),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
});

const guardianSchema = z.object({
  name: z.string().min(1, "Guardian's name is required"),
  relationship: z.string().optional(),
  phone: z.string().min(6, "Guardian's phone is required"),
  email: z.string().email().optional().or(z.literal('')),
});

// Deliberately does NOT include name, email, registrationNumber, or
// status — those stay staff-managed. A resident editing their own login
// email without re-verification would be a security gap, not a feature.
export const updateMyProfileSchema = z.object({
  phone: z.string().min(6).max(20).optional(),
  guardian: guardianSchema.optional(),
});

export const uploadMyDocumentSchema = z.object({
  fileType: z.enum(DOCUMENT_TYPES).optional(),
});
