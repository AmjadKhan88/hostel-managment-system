import mongoose from 'mongoose';
import { ALL_PERMISSIONS, SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', default: null, index: true },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (perms) =>
          perms.every((p) => p === SUPER_ADMIN_WILDCARD || ALL_PERMISSIONS.includes(p)),
        message: 'permissions must be a known permission key or the "*" wildcard',
      },
    },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roleSchema.index({ slug: 1, hostelId: 1 }, { unique: true });

export const Role = mongoose.model('Role', roleSchema);