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
    // null for system-generated recurring instances — see recordedBy usage
    // in recurringExpenseProcessor.js.
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Groups this expense with the recurring series it belongs to.
    // Defaults to this document's own _id (see the pre-validate hook
    // below), so every manually-created expense starts its own series of
    // one. When recurrence stays 'monthly', the automated job
    // (jobs/processors/recurringExpenseProcessor.js) copies this value
    // onto each new instance it generates, always deriving from the MOST
    // RECENT instance in the series — so editing an instance's amount
    // changes what future months copy from.
    seriesId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Set only by the automated job — same database-enforced
    // duplicate-prevention pattern as Invoice.idempotencyKey.
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true }
);

expenseSchema.pre('validate', function assignSeriesId(next) {
  if (!this.seriesId) this.seriesId = this._id;
  next();
});

expenseSchema.index({ hostelId: 1, incurredAt: -1 });
expenseSchema.index({ hostelId: 1, category: 1 });
expenseSchema.index({ hostelId: 1, seriesId: 1, incurredAt: -1 });
// Partial, NOT sparse. `default: null` stores an explicit null, and a sparse
// index still indexes nulls (it only skips MISSING fields), so every manually
// created expense in a hostel used to collide with the previous one. Only
// documents with a real string key are indexed now.
expenseSchema.index(
  { hostelId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);

export const Expense = mongoose.model('Expense', expenseSchema);
