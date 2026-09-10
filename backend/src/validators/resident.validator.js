import { z } from 'zod';
import { RESIDENT_STATUSES } from '../models/Resident.model.js';

const guardianSchema = z.object({
  name: z.string().min(1, "Guardian's name is required"),
  relationship: z.string().optional(),
  phone: z.string().min(6, "Guardian's phone is required"),
  email: z.string().email().optional().or(z.literal('')),
});

export const createResidentSchema = z.object({
  hostelId: z.string().optional(), // optional for non-super-admins; resolved server-side
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(6).max(20),
  registrationNumber: z.string().min(1).max(40),
  institution: z.string().max(160).optional(),
  department: z.string().max(160).optional(),
  guardian: guardianSchema,
  joiningDate: z.coerce.date().optional(),
  expectedLeavingDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateResidentSchema = createResidentSchema
  .omit({ hostelId: true, registrationNumber: true })
  .partial()
  .extend({
    status: z.enum(RESIDENT_STATUSES).optional(),
  });