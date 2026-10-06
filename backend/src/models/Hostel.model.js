import mongoose from 'mongoose';

export const PAYMENT_METHOD_TYPES = ['bank_transfer', 'jazzcash', 'easypaisa', 'other'];

const paymentMethodSchema = new mongoose.Schema(
  {
    type: { type: String, enum: PAYMENT_METHOD_TYPES, required: true },
    label: { type: String, required: true, trim: true, maxlength: 80 }, // e.g. "HBL - Main Account"
    accountName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    bankName: { type: String, trim: true, default: '' }, // relevant for bank_transfer only
    instructions: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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

    // Accounts residents are shown when paying via the Portal's manual
    // payment workflow — see PaymentSubmission.model.js and
    // paymentSubmission.service.js.
    paymentMethods: { type: [paymentMethodSchema], default: [] },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hostel = mongoose.model('Hostel', hostelSchema);
