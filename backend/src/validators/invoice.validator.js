import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1).max(200),
  feeType: z.string().max(40).optional(),
  amountMinorUnits: z.coerce.number().int().min(0),
});

export const createInvoiceSchema = z.object({
  hostelId: z.string().optional(),
  residentId: z.string().min(1, 'residentId is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  dueDate: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});