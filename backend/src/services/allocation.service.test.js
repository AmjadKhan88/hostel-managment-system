import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { startTestDb, stopTestDb, clearTestDb } from '../test/setupTestDb.js';
import { Hostel } from '../models/Hostel.model.js';
import { Resident } from '../models/Resident.model.js';
import { Room } from '../models/Room.model.js';
import { Bed } from '../models/Bed.model.js';
import { Allocation } from '../models/Allocation.model.js';
import * as allocationService from './allocation.service.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);

async function createFixtures() {
  const hostel = await Hostel.create({ name: 'Test Hostel', slug: 'test-hostel' });
  const resident = await Resident.create({
    hostelId: hostel._id,
    name: 'Test Resident',
    phone: '+920000000',
    registrationNumber: 'REG-1',
    guardian: { name: 'Guardian', phone: '+920000001' },
    status: 'pending',
  });
  const room = await Room.create({
    hostelId: hostel._id,
    buildingId: new mongoose.Types.ObjectId(),
    floorId: new mongoose.Types.ObjectId(),
    roomNumber: '101',
    category: 'double',
    capacity: 2,
  });
  const bed = await Bed.create({ hostelId: hostel._id, roomId: room._id, bedNumber: 'A' });
  const bedTwo = await Bed.create({ hostelId: hostel._id, roomId: room._id, bedNumber: 'B' });

  const user = {
    id: new mongoose.Types.ObjectId().toString(),
    hostelId: null,
    permissions: [SUPER_ADMIN_WILDCARD],
  };

  return { hostel, resident, room, bed, bedTwo, user };
}

describe('allocation.service', () => {
  it('allocates an available bed to a resident and updates both records', async () => {
    const { resident, bed, user } = await createFixtures();

    const allocation = await allocationService.allocateBed(user, {
      residentId: resident._id,
      bedId: bed._id,
    });

    expect(allocation.status).toBe('active');

    const updatedBed = await Bed.findById(bed._id);
    const updatedResident = await Resident.findById(resident._id);
    expect(updatedBed.status).toBe('occupied');
    expect(updatedBed.currentResidentId.toString()).toBe(resident._id.toString());
    expect(updatedResident.status).toBe('active');
    expect(updatedResident.currentBedId.toString()).toBe(bed._id.toString());
  });

  it('refuses to allocate a bed that is already occupied', async () => {
    const { resident, bed, user } = await createFixtures();
    await allocationService.allocateBed(user, { residentId: resident._id, bedId: bed._id });

    const secondResident = await Resident.create({
      hostelId: resident.hostelId,
      name: 'Second Resident',
      phone: '+920000002',
      registrationNumber: 'REG-2',
      guardian: { name: 'Guardian 2', phone: '+920000003' },
      status: 'pending',
    });

    await expect(
      allocationService.allocateBed(user, { residentId: secondResident._id, bedId: bed._id })
    ).rejects.toThrow(/not available/i);
  });

  it('refuses to allocate a second active bed to the same resident', async () => {
    const { resident, bed, bedTwo, user } = await createFixtures();
    await allocationService.allocateBed(user, { residentId: resident._id, bedId: bed._id });

    await expect(
      allocationService.allocateBed(user, { residentId: resident._id, bedId: bedTwo._id })
    ).rejects.toThrow(/already has an active bed allocation/i);
  });

  it('the Allocation model rejects a duplicate active row for the same bed at the DATABASE level', async () => {
    const { hostel, resident, bed, user } = await createFixtures();
    await allocationService.allocateBed(user, { residentId: resident._id, bedId: bed._id });

    // Simulate a race: insert a second *active* allocation for the same bed
    // directly, bypassing the service-level check entirely. The Allocation
    // model's partial unique index should still reject it — this is the
    // "even if application logic has a bug" guarantee from Day 10.
    const otherResident = await Resident.create({
      hostelId: hostel._id,
      name: 'Racer',
      phone: '+920000009',
      registrationNumber: 'REG-9',
      guardian: { name: 'G', phone: '+920000008' },
      status: 'pending',
    });

    await expect(
      Allocation.create({
        hostelId: hostel._id,
        residentId: otherResident._id,
        roomId: bed.roomId,
        bedId: bed._id,
        allocatedBy: user.id,
      })
    ).rejects.toThrow();
  });

  it('transfers a resident to a new bed, freeing the old one', async () => {
    const { resident, bed, bedTwo, user } = await createFixtures();
    await allocationService.allocateBed(user, { residentId: resident._id, bedId: bed._id });

    await allocationService.transferResident(user, resident._id, { newBedId: bedTwo._id });

    const oldBed = await Bed.findById(bed._id);
    const newBed = await Bed.findById(bedTwo._id);
    const updatedResident = await Resident.findById(resident._id);

    expect(oldBed.status).toBe('available');
    expect(oldBed.currentResidentId).toBeNull();
    expect(newBed.status).toBe('occupied');
    expect(updatedResident.currentBedId.toString()).toBe(bedTwo._id.toString());
  });

  it('checks out a resident, freeing their bed and marking them checked_out', async () => {
    const { resident, bed, user } = await createFixtures();
    await allocationService.allocateBed(user, { residentId: resident._id, bedId: bed._id });

    await allocationService.checkoutResident(user, resident._id);

    const updatedBed = await Bed.findById(bed._id);
    const updatedResident = await Resident.findById(resident._id);

    expect(updatedBed.status).toBe('available');
    expect(updatedResident.status).toBe('checked_out');
    expect(updatedResident.currentBedId).toBeNull();
  });
});
