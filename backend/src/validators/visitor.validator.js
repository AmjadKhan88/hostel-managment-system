import { z } from 'zod';

export const checkInVisitorSchema = z.object({
  hostelId: z.string().optional(),
  residentId: z.string().min(1, 'residentId is required'),
  visitorName: z.string().min(2, "Visitor's name is required"),
  phone: z.string().min(6, 'Phone number is required'),
  purpose: z.string().max(300).optional(),
});