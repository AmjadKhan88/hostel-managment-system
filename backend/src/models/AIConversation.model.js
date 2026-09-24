import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true, trim: true, maxlength: 2000 },
    answer: { type: String, required: true, trim: true },
    toolUsed: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiConversationSchema.index({ hostelId: 1, userId: 1, createdAt: -1 });

export const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
