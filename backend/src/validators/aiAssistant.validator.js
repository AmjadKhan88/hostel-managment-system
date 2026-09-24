import { z } from 'zod';

export const askAssistantSchema = z.object({
  hostelId: z.string().optional(),
  question: z.string().min(1).max(500),
});
