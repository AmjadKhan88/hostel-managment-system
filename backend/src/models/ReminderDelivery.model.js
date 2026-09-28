import mongoose from 'mongoose';

export const REMINDER_CHANNELS = ['email', 'whatsapp'];
// pending  = claimed, provider call in flight (or the worker died mid-send)
// sent     = provider confirmed acceptance
// failed   = provider/transport error (retryable, bounded)
// unknown  = a pending claim went stale; delivery can't be confirmed, so it
//            is deliberately NEVER retried (avoids a duplicate message)
export const REMINDER_DELIVERY_STATUSES = ['pending', 'sent', 'failed', 'unknown'];

const reminderDeliverySchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },

    round: { type: Number, required: true, min: 1 },
    channel: { type: String, enum: REMINDER_CHANNELS, required: true },
    status: { type: String, enum: REMINDER_DELIVERY_STATUSES, required: true },

    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    detail: { type: String, default: '' }, // provider error / explanation
  },
  { timestamps: true }
);

// The idempotency guarantee: one delivery record per (invoice, round,
// channel), enforced by the database. A retried job cannot claim the same
// slot twice, so it cannot send the same reminder twice.
reminderDeliverySchema.index({ invoiceId: 1, round: 1, channel: 1 }, { unique: true });
reminderDeliverySchema.index({ hostelId: 1, createdAt: -1 });
reminderDeliverySchema.index({ status: 1, lastAttemptAt: 1 }); // stale-pending sweep

export const ReminderDelivery = mongoose.model('ReminderDelivery', reminderDeliverySchema);
