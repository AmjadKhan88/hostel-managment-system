import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const RESIDENT_STATUSES = ['pending', 'active', 'checked_out'];
export const PORTAL_ACCOUNT_STATUSES = ['not_invited', 'invited', 'active', 'disabled'];

const guardianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

// Kept as a nested subdocument, cleanly separated from the resident's
// profile fields — this is what the Resident Portal's auth actually reads
// and writes, via residentAuth.service.js.
const portalAccountSchema = new mongoose.Schema(
  {
    passwordHash: { type: String, default: null, select: false },
    status: { type: String, enum: PORTAL_ACCOUNT_STATUSES, default: 'not_invited' },
    // Bumped to invalidate all outstanding resident refresh tokens — same
    // revocation pattern as User.tokenVersion.
    tokenVersion: { type: Number, default: 0 },
    invitedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    // Only the HASH of a setup/reset token is ever stored — same practice
    // as a password, so a database read alone can't produce a usable link.
    setupTokenHash: { type: String, default: null, select: false },
    setupTokenExpiresAt: { type: Date, default: null },
  },
  { _id: false }
);

const residentSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },

    name: { type: String, required: true, trim: true },
    // Unique (sparse) because this is now also a login identifier for the
    // Resident Portal — two residents, even across different hostels,
    // must never be ambiguous on login. Was optional/unconstrained before
    // the portal existed (Day 8); still optional, just now unique when set.
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    phone: { type: String, required: true, trim: true },

    registrationNumber: { type: String, required: true, trim: true },

    institution: { type: String, trim: true },
    department: { type: String, trim: true },

    guardian: { type: guardianSchema, required: true },

    joiningDate: { type: Date, default: null },
    expectedLeavingDate: { type: Date, default: null },

    status: { type: String, enum: RESIDENT_STATUSES, default: 'pending' },

    currentBedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', default: null },

    notes: { type: String, trim: true, default: '' },

    portalAccount: { type: portalAccountSchema, default: () => ({}) },
  },
  { timestamps: true }
);

residentSchema.index({ hostelId: 1, registrationNumber: 1 }, { unique: true });
residentSchema.index({ hostelId: 1, name: 'text', email: 'text', phone: 'text' });

residentSchema.methods.comparePortalPassword = function comparePortalPassword(plainPassword) {
  if (!this.portalAccount?.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plainPassword, this.portalAccount.passwordHash);
};

residentSchema.statics.hashPortalPassword = function hashPortalPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

export const Resident = mongoose.model('Resident', residentSchema);
