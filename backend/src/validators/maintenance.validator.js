import { z } from 'zod';
import {
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
} from '../models/MaintenanceTicket.model.js';

export const createMaintenanceSchema = z.object({
  hostelId: z.string().optional(),
  roomId: z.string().min(1, 'roomId is required'),
  title: z.string().min(3).max(160),
  description: z.string().min(5).max(3000),
  category: z.enum(MAINTENANCE_CATEGORIES),
  priority: z.enum(MAINTENANCE_PRIORITIES).optional(),
  scheduledDate: z.coerce.date().optional(),
});

export const updateMaintenanceSchema = z.object({
  status: z.enum(MAINTENANCE_STATUSES).optional(),
  priority: z.enum(MAINTENANCE_PRIORITIES).optional(),
  assignedTo: z.string().nullable().optional(),
  scheduledDate: z.coerce.date().nullable().optional(),
  costMinorUnits: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});