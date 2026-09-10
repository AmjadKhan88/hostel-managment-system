import { Allocation } from '../models/Allocation.model.js';
import { Bed } from '../models/Bed.model.js';
import { Resident } from '../models/Resident.model.js';
import { Room } from '../models/Room.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

async function loadBedWithRoom(bedId) {
  const bed = await Bed.findById(bedId);
  if (!bed) throw ApiError.notFound('Bed not found');
  const room = await Room.findById(bed.roomId);
  if (!room) throw ApiError.internal('Bed references a room that no longer exists');
  return { bed, room };
}

async function endActiveAllocation(resident, bed, { endedBy, endReason }) {
  const allocation = await Allocation.findOneAndUpdate(
    { residentId: resident._id, bedId: bed._id, status: 'active' },
    { status: 'ended', endedAt: new Date(), endedBy, endReason },
    { new: true }
  );
  if (!allocation) throw ApiError.conflict('No active allocation found to end');
  return allocation;
}

/**
 * NOTE: this environment runs MongoDB as a standalone server (no replica
 * set), so true multi-document transactions aren't available here — see
 * docs/ARCHITECTURE.md. Each step below is applied in an order chosen so
 * that a failure partway through is safe to recover from, and failures are
 * compensated (best-effort) rather than left inconsistent. This is a
 * reduced guarantee compared to a transactional implementation; revisit
 * with mongoose sessions if this ever runs against a replica set (e.g.
 * MongoDB Atlas) in production.
 */
export async function allocateBed(user, { residentId, bedId, notes }) {
  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');

  const hostelId = resolveHostelScope(user, resident.hostelId.toString());

  const { bed, room } = await loadBedWithRoom(bedId);
  if (bed.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('Bed does not belong to the same hostel as the resident');
  }
  if (resident.currentBedId) {
    throw ApiError.conflict('Resident already has an active bed allocation — use transfer instead');
  }
  if (bed.status !== 'available') {
    throw ApiError.conflict(`Bed is not available (current status: ${bed.status})`);
  }

  // 1. Create the allocation record first — the partial unique index on
  //    { residentId, status: 'active' } / { bedId, status: 'active' } will
  //    reject this if a race condition already allocated either side.
  let allocation;
  try {
    allocation = await Allocation.create({
      hostelId,
      residentId: resident._id,
      roomId: room._id,
      bedId: bed._id,
      allocatedBy: user.id,
      notes,
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw ApiError.conflict('This resident or bed already has an active allocation');
    }
    throw err;
  }

  // 2. Update the bed and resident. If either write fails here, the
  //    allocation record above is rolled back to keep state consistent.
  try {
    bed.status = 'occupied';
    bed.currentResidentId = resident._id;
    await bed.save();

    resident.currentBedId = bed._id;
    resident.status = 'active';
    await resident.save();
  } catch (err) {
    await Allocation.findByIdAndDelete(allocation._id).catch(() => {});
    await Bed.findByIdAndUpdate(bed._id, { status: 'available', currentResidentId: null }).catch(() => {});
    throw err;
  }

  return allocation;
}

export async function transferResident(user, residentId, { newBedId, notes }) {
  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  const hostelId = resolveHostelScope(user, resident.hostelId.toString());

  if (!resident.currentBedId) {
    throw ApiError.badRequest('Resident has no active bed to transfer from');
  }

  const currentBed = await Bed.findById(resident.currentBedId);
  const { bed: newBed, room: newRoom } = await loadBedWithRoom(newBedId);

  if (newBed.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('New bed does not belong to the same hostel');
  }
  if (newBed.status !== 'available') {
    throw ApiError.conflict(`New bed is not available (current status: ${newBed.status})`);
  }
  if (newBed._id.toString() === currentBed._id.toString()) {
    throw ApiError.badRequest('Resident is already assigned to this bed');
  }

  // End the old allocation and free the old bed first — this is the safer
  // order if something fails midway, since a resident briefly unassigned
  // is less harmful than a resident stuck on two beds at once.
  await endActiveAllocation(resident, currentBed, { endedBy: user.id, endReason: 'transfer' });
  currentBed.status = 'available';
  currentBed.currentResidentId = null;
  await currentBed.save();

  let newAllocation;
  try {
    newAllocation = await Allocation.create({
      hostelId,
      residentId: resident._id,
      roomId: newRoom._id,
      bedId: newBed._id,
      allocatedBy: user.id,
      notes,
    });

    newBed.status = 'occupied';
    newBed.currentResidentId = resident._id;
    await newBed.save();

    resident.currentBedId = newBed._id;
    await resident.save();
  } catch (err) {
    if (err?.code === 11000) {
      throw ApiError.conflict('This resident or bed already has an active allocation');
    }
    throw err;
  }

  return newAllocation;
}

export async function checkoutResident(user, residentId) {
  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  resolveHostelScope(user, resident.hostelId.toString());

  if (!resident.currentBedId) {
    throw ApiError.badRequest('Resident has no active bed allocation to check out from');
  }

  const bed = await Bed.findById(resident.currentBedId);

  const allocation = await endActiveAllocation(resident, bed, { endedBy: user.id, endReason: 'checkout' });

  bed.status = 'available';
  bed.currentResidentId = null;
  await bed.save();

  resident.currentBedId = null;
  resident.status = 'checked_out';
  await resident.save();

  return allocation;
}

export async function listAllocationHistoryForResident(user, residentId) {
  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  resolveHostelScope(user, resident.hostelId.toString());

  return Allocation.find({ residentId }).sort({ allocatedAt: -1 });
}