import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = [
  'electricity',
  'water',
  'internet',
  'salary',
  'maintenance_supplies',
  'technical',
  'rent',
  'other',
];
export const EXPENSE_RECURRENCE = ['one_time', 'monthly'];

const expenseSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    amountMinorUnits: { type: Number, required: true, min: 0 },
    recurrence: { type: String, enum: EXPENSE_RECURRENCE, default: 'one_time' },
    incurredAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ hostelId: 1, incurredAt: -1 });
expenseSchema.index({ hostelId: 1, category: 1 });

export const Expense = mongoose.model('Expense', expenseSchema);
