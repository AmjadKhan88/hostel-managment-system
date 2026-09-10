import mongoose from 'mongoose';

export const BED_STATUSES = ['available', 'occupied', 'maintenance'];

const bedSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    bedNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: BED_STATUSES, default: 'available' },
    // Wired up on the Room Allocation day — the field exists now so that
    // work doesn't require a schema migration later.
    currentResidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  },
  { timestamps: true }
);

bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

export const Bed = mongoose.model('Bed', bedSchema);