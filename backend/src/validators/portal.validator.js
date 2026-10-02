import { z } from 'zod';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../models/Complaint.model.js';

export const submitComplaintSchema = z.object({
  subject: z.string().min(3).max(160),
  description: z.string().min(5).max(3000),
  category: z.enum(COMPLAINT_CATEGORIES),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
});
