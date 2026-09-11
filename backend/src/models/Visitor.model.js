import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },

    visitorName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    purpose: { type: String, trim: true, default: '' },

    checkInAt: { type: Date, default: Date.now },
    checkOutAt: { type: Date, default: null },

    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Fast lookup of everyone currently on site.
visitorSchema.index({ hostelId: 1, checkOutAt: 1 });

export const Visitor = mongoose.model('Visitor', visitorSchema);