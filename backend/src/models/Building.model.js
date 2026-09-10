import mongoose from 'mongoose';

const floorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Ground Floor", "3rd Floor"
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false }
);

const buildingSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    name: { type: String, required: true, trim: true },
    floors: { type: [floorSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

buildingSchema.index({ hostelId: 1, name: 1 }, { unique: true });

export const Building = mongoose.model('Building', buildingSchema);