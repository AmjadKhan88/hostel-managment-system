import mongoose from 'mongoose';

export const FEE_TYPES = ['rent', 'security_deposit', 'mess', 'utilities', 'other'];
export const BILLING_CYCLES = ['monthly', 'one_time'];

const feeStructureSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    feeType: { type: String, enum: FEE_TYPES, required: true },
    roomCategory: { type: String, trim: true, default: '' }, // blank = applies to all categories
    billingCycle: { type: String, enum: BILLING_CYCLES, default: 'monthly' },
    amountMinorUnits: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feeStructureSchema.index({ hostelId: 1, name: 1 }, { unique: true });

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);