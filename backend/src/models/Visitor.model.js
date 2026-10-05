import mongoose from 'mongoose';

export const VISITOR_STATUSES = ['expected', 'inside', 'checked_out', 'cancelled'];

const visitorSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: true,
      index: true,
    },

    visitorName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    purpose: { type: String, trim: true, default: '' },

    status: { type: String, enum: VISITOR_STATUSES, default: 'inside' },

    // Set by the resident when pre-registering ("I'm expecting someone
    // around 3pm"). Purely informational for gate staff — not enforced.
    expectedAt: { type: Date, default: null },

    // Only set once the visitor actually arrives and is checked in — no
    // longer defaults to "now" at creation time, since a pre-registered
    // (status: 'expected') visitor hasn't arrived yet. Staff walk-in
    // registration and the portal's "check in an expected visitor" action
    // both set this explicitly (see visitor.service.js).
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },

    // null when a resident pre-registered this themselves via the Portal.
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

visitorSchema.index({ hostelId: 1, status: 1 });
visitorSchema.index({ hostelId: 1, checkOutAt: 1 });

export const Visitor = mongoose.model('Visitor', visitorSchema);
