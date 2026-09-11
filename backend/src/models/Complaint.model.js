import mongoose from 'mongoose';

export const COMPLAINT_CATEGORIES = ['plumbing', 'electrical', 'cleanliness', 'noise', 'security', 'internet', 'other'];
export const COMPLAINT_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const COMPLAINT_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const commentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const complaintSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },

    subject: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, enum: COMPLAINT_CATEGORIES, required: true },
    priority: { type: String, enum: COMPLAINT_PRIORITIES, default: 'medium' },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'open' },

    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    comments: { type: [commentSchema], default: [] },

    resolvedAt: { type: Date, default: null },
    resolutionNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

complaintSchema.index({ hostelId: 1, status: 1 });
complaintSchema.index({ hostelId: 1, priority: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);