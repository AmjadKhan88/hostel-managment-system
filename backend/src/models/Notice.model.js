import mongoose from 'mongoose';

export const NOTICE_AUDIENCES = ['everyone', 'staff', 'residents'];

const noticeSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    audience: { type: String, enum: NOTICE_AUDIENCES, default: 'everyone' },

    publishAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

noticeSchema.index({ hostelId: 1, publishAt: -1 });

// Computed, not stored — no background job needed to keep it accurate.
noticeSchema.virtual('status').get(function () {
  const now = new Date();
  if (this.publishAt > now) return 'scheduled';
  if (this.expiresAt && this.expiresAt < now) return 'expired';
  return 'published';
});

noticeSchema.set('toJSON', { virtuals: true });
noticeSchema.set('toObject', { virtuals: true });

export const Notice = mongoose.model('Notice', noticeSchema);