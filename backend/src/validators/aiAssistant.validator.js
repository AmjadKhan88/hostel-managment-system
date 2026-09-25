import { z } from 'zod';

export const askAssistantSchema = z.object({
  hostelId: z.string().optional(),
  question: z.string().min(1).max(500),
});

export const generateNoticeDraftSchema = z.object({
  hostelId: z.string().optional(),
  type: z.enum(['announcement', 'payment_reminder', 'maintenance', 'emergency']),
  prompt: z.string().min(3).max(500),
});

export const triageComplaintSchema = z.object({
  hostelId: z.string().optional(),
  description: z.string().min(5).max(3000),
});

export const suggestRoomsSchema = z.object({
  hostelId: z.string().optional(),
  category: z.string().optional(),
  maxBudgetMinorUnits: z.coerce.number().int().min(0).optional(),
  minCapacity: z.coerce.number().int().min(1).optional(),
  facilities: z.array(z.string()).optional(),
});
