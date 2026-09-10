import mongoose from 'mongoose';

export const ALLOCATION_STATUSES = ['active', 'ended'];
export const ALLOCATION_END_REASONS = ['transfer', 'checkout'];

const allocationSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true, index: true },

    status: { type: String, enum: ALLOCATION_STATUSES, default: 'active' },
    allocatedAt: { type: Date, default: Date.now },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    endedAt: { type: Date, default: null },
    endedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    endReason: { type: String, enum: ALLOCATION_END_REASONS, default: null },

    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Database-level guarantee — not just application logic — that a resident
// or a bed can have at most one ACTIVE allocation at a time. Even a bug or
// a race condition that slips past the transaction gets rejected here.
allocationSchema.index(
  { residentId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
allocationSchema.index(
  { bedId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

export const Allocation = mongoose.model('Allocation', allocationSchema);