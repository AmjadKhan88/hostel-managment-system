import mongoose from 'mongoose';

export const INVOICE_STATUSES = ['issued', 'partially_paid', 'paid', 'void'];

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 200 },
    feeType: { type: String, trim: true, default: 'other' },
    amountMinorUnits: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },

    invoiceNumber: { type: String, required: true, trim: true },
    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'An invoice must have at least one line item',
      },
    },

    totalMinorUnits: { type: Number, required: true, min: 0 },
    paidMinorUnits: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: INVOICE_STATUSES, default: 'issued' },

    dueDate: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },

    notes: { type: String, trim: true, default: '' },
    // Manual invoices (Day 22) have an actor; system-generated ones
    // (today's automation) don't, so this is no longer required.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Set only by the automated monthly-invoice job. A database-level
    // guarantee — not just application logic — that a retried or re-run
    // job can never create the same month's charge twice.
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true }
);

invoiceSchema.index({ hostelId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ hostelId: 1, residentId: 1 });
invoiceSchema.index({ hostelId: 1, status: 1 });
invoiceSchema.index({ hostelId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

invoiceSchema.virtual('balanceMinorUnits').get(function () {
  return this.totalMinorUnits - this.paidMinorUnits;
});
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);