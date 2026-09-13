import mongoose from 'mongoose';

export const DOCUMENT_TYPES = ['id_card', 'guardian_id', 'photo', 'admission_form', 'other'];

const documentSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },

    fileType: { type: String, enum: DOCUMENT_TYPES, default: 'other' },
    originalFileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },

    // Cloudinary references — url is what the frontend renders/links to,
    // publicId is what we need in order to delete the asset later.
    url: { type: String, required: true },
    publicId: { type: String, required: true },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

documentSchema.index({ hostelId: 1, residentId: 1 });

export const Document = mongoose.model('Document', documentSchema);