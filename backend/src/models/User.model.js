import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', default: null, index: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },

    // Password reset — only the SHA-256 HASH of the emailed token is ever
    // stored, so a database read alone can't produce a usable reset link.
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null },
    // Drives the per-account cooldown on how often a reset email can be sent.
    passwordResetRequestedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Reset lookups go by token hash. Partial so only users with an active reset
// are indexed, not every user's null.
userSchema.index(
  { passwordResetTokenHash: 1 },
  { partialFilterExpression: { passwordResetTokenHash: { $type: 'string' } } }
);

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

export const User = mongoose.model('User', userSchema);
