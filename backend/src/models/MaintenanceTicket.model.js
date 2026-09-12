import mongoose from 'mongoose';

export const MAINTENANCE_CATEGORIES = ['plumbing', 'electrical', 'carpentry', 'painting', 'appliance', 'other'];
export const MAINTENANCE_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const MAINTENANCE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const maintenanceTicketSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, enum: MAINTENANCE_CATEGORIES, required: true },
    priority: { type: String, enum: MAINTENANCE_PRIORITIES, default: 'medium' },
    status: { type: String, enum: MAINTENANCE_STATUSES, default: 'open' },

    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    scheduledDate: { type: Date, default: null },
    // Stored as integer minor units (paisa/cents) — see docs/ARCHITECTURE.md's
    // money-representation note. The frontend divides by 100 for display.
    costMinorUnits: { type: Number, default: 0, min: 0 },

    resolvedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

maintenanceTicketSchema.index({ hostelId: 1, status: 1 });
maintenanceTicketSchema.index({ hostelId: 1, roomId: 1 }); // "this room's maintenance history"

export const MaintenanceTicket = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);