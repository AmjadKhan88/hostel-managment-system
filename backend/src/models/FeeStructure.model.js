import mongoose from 'mongoose';
import { ROOM_CATEGORIES } from './Room.model.js';

export const FEE_TYPES = ['rent', 'security_deposit', 'mess', 'utilities', 'other'];
export const BILLING_CYCLES = ['monthly', 'one_time'];

const feeStructureSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    feeType: { type: String, enum: FEE_TYPES, required: true },
    // Blank/null = applies to every room category. Constrained to Room's
    // actual categories (not free text) so this can be matched exactly
    // against a resident's real room — a typo here used to mean the fee
    // silently matched nobody, ever.
    roomCategory: { type: String, enum: ROOM_CATEGORIES, default: null },
    billingCycle: { type: String, enum: BILLING_CYCLES, default: 'monthly' },
    amountMinorUnits: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feeStructureSchema.index({ hostelId: 1, name: 1 }, { unique: true });

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
