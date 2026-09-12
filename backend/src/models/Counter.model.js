import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "invoice:<hostelId>"
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically increments and returns the next sequence number for `key`.
 * A single findOneAndUpdate is atomic even without a multi-document
 * transaction, so this is race-safe under concurrent requests.
 */
export async function getNextSequence(key) {
  const counter = await Counter.findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq;
}