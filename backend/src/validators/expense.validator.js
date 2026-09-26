import { z } from 'zod';
import { EXPENSE_CATEGORIES, EXPENSE_RECURRENCE } from '../models/Expense.model.js';

export const createExpenseSchema = z.object({
  hostelId: z.string().optional(),
  title: z.string().min(2).max(160),
  category: z.enum(EXPENSE_CATEGORIES),
  amountMinorUnits: z.coerce.number().int().min(0),
  recurrence: z.enum(EXPENSE_RECURRENCE).optional(),
  incurredAt: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateExpenseSchema = createExpenseSchema.omit({ hostelId: true }).partial();
