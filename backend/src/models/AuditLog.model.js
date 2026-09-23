import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', default: null, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Freeform hint for cases with no resolvable actorId yet — e.g. a
    // failed login attempt against an email that doesn't exist. When
    // actorId IS set, prefer populating it for display; this is a fallback.
    actorName: { type: String, trim: true, default: null },

    action: { type: String, required: true, trim: true }, // e.g. "auth.login", "resident.created"
    entityType: { type: String, trim: true, default: null },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Safe, non-sensitive context only — never passwords, tokens, or secrets.
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // append-only — no updatedAt needed
);

auditLogSchema.index({ hostelId: 1, createdAt: -1 });
auditLogSchema.index({ hostelId: 1, action: 1 });
auditLogSchema.index({ hostelId: 1, entityType: 1, entityId: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);