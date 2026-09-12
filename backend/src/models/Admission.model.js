import mongoose from 'mongoose';

export const ADMISSION_STATUSES = ['applied', 'waitlisted', 'approved', 'rejected', 'checked_in', 'cancelled'];

const admissionSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    // One admission record per resident — enforced by the unique index below.
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true, unique: true },

    status: { type: String, enum: ADMISSION_STATUSES, default: 'applied' },

    requestedCategory: { type: String, trim: true, default: '' }, // preference only, not enforced at allocation
    documentsVerified: { type: Boolean, default: false },

    // Recorded amounts only — not real ledger/payment entries until Fees &
    // Accounting exists. Stored as integer minor units per the documented
    // money convention.
    securityDepositMinorUnits: { type: Number, default: 0, min: 0 },
    initialPaymentMinorUnits: { type: Number, default: 0, min: 0 },

    decisionNotes: { type: String, trim: true, default: '' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },

    checkedInAt: { type: Date, default: null },
    allocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation', default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

admissionSchema.index({ hostelId: 1, status: 1 });

export const Admission = mongoose.model('Admission', admissionSchema);