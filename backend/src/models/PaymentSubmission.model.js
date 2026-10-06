import mongoose from 'mongoose';
import { PAYMENT_METHODS } from './Payment.model.js';

export const PAYMENT_SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'];

const paymentSubmissionSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: true,
      index: true,
    },

    amountMinorUnits: { type: Number, required: true, min: 1 },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    paidToLabel: { type: String, trim: true, default: '' }, // which configured account they say they paid into
    transactionReference: { type: String, trim: true, default: '' },

    screenshotUrl: { type: String, required: true },
    screenshotPublicId: { type: String, required: true },

    status: { type: String, enum: PAYMENT_SUBMISSION_STATUSES, default: 'pending' },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: '' },

    // Set only on approval — links back to the real Payment record created
    // by the existing recordPayment() flow, so a submission's full history
    // (claim → review → actual ledger entry) is traceable end to end.
    resultingPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  },
  { timestamps: true }
);

paymentSubmissionSchema.index({ hostelId: 1, status: 1, createdAt: 1 });
paymentSubmissionSchema.index({ hostelId: 1, residentId: 1 });
paymentSubmissionSchema.index({ hostelId: 1, invoiceId: 1 });

export const PaymentSubmission = mongoose.model('PaymentSubmission', paymentSubmissionSchema);
