import mongoose from 'mongoose';

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'mobile_wallet', 'other'];
export const PAYMENT_STATUSES = ['completed', 'refunded'];

const paymentSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },

    receiptNumber: { type: String, required: true, trim: true },
    amountMinorUnits: { type: Number, required: true, min: 1 },
    method: { type: String, enum: PAYMENT_METHODS, default: 'cash' },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'completed' },

    paidAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, default: '' },

    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    refundedAt: { type: Date, default: null },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    refundReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ hostelId: 1, receiptNumber: 1 }, { unique: true });
paymentSchema.index({ hostelId: 1, invoiceId: 1 });
paymentSchema.index({ hostelId: 1, residentId: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);