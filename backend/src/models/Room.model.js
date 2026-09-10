import mongoose from 'mongoose';

export const ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'inactive'];
export const ROOM_CATEGORIES = ['single', 'double', 'triple', 'dormitory', 'suite'];

const roomSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    floorId: { type: mongoose.Schema.Types.ObjectId, required: true }, // subdocument id within Building.floors
    roomNumber: { type: String, required: true, trim: true },
    category: { type: String, enum: ROOM_CATEGORIES, required: true },
    capacity: { type: Number, required: true, min: 1 },
    amenities: { type: [String], default: [] },
    status: { type: String, enum: ROOM_STATUSES, default: 'available' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A room number is unique within its hostel (not globally).
roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });

export const Room = mongoose.model('Room', roomSchema);