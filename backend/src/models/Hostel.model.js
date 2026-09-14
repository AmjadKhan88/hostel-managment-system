import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: {
      line1: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    timezone: { type: String, default: 'Asia/Karachi' },
    currency: { type: String, default: 'PKR' },

    logoUrl: { type: String, default: null },
    logoPublicId: { type: String, default: null },

    invoicePrefix: { type: String, default: 'INV', trim: true, maxlength: 10 },
    defaultDueDays: { type: Number, default: 7, min: 0 },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hostel = mongoose.model('Hostel', hostelSchema);