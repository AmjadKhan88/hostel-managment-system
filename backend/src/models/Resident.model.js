import mongoose from 'mongoose';

export const RESIDENT_STATUSES = ['pending', 'active', 'checked_out'];

const guardianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const residentSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },

    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },

    registrationNumber: { type: String, required: true, trim: true },

    institution: { type: String, trim: true },
    department: { type: String, trim: true },

    guardian: { type: guardianSchema, required: true },

    joiningDate: { type: Date, default: null },
    expectedLeavingDate: { type: Date, default: null },

    status: { type: String, enum: RESIDENT_STATUSES, default: 'pending' },

    // Populated on the Room Allocation day. Kept here now so that work is
    // additive rather than a schema migration.
    currentBedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', default: null },

    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// A registration number is unique within its hostel (not globally — two
// hostels under the same owner may use overlapping numbering schemes).
residentSchema.index({ hostelId: 1, registrationNumber: 1 }, { unique: true });
residentSchema.index({ hostelId: 1, name: 'text', email: 'text', phone: 'text' });

export const Resident = mongoose.model('Resident', residentSchema);