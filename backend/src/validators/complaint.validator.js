import { z } from 'zod';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from '../models/Complaint.model.js';

export const createComplaintSchema = z.object({
  hostelId: z.string().optional(),
  residentId: z.string().optional(),
  roomId: z.string().optional(),
  subject: z.string().min(3).max(160),
  description: z.string().min(5).max(3000),
  category: z.enum(COMPLAINT_CATEGORIES),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES).optional(),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
  assignedTo: z.string().nullable().optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

export const addCommentSchema = z.object({
  text: z.string().min(1).max(2000),
});