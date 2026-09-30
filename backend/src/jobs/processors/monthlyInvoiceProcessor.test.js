import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../events/socketEvents.js', () => ({
  emitToHostel: vi.fn(),
  setSocketServer: vi.fn(),
}));

import { startTestDb, stopTestDb, clearTestDb } from '../../test/setupTestDb.js';
import { Hostel } from '../../models/Hostel.model.js';
import { Resident } from '../../models/Resident.model.js';
import { Building } from '../../models/Building.model.js';
import { Room } from '../../models/Room.model.js';
import { Bed } from '../../models/Bed.model.js';
import { FeeStructure } from '../../models/FeeStructure.model.js';
import { Invoice } from '../../models/Invoice.model.js';
import { generateMonthlyInvoices } from './monthlyInvoiceProcessor.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);

async function makeResidentInRoom(hostel, buildingId, category, bedNumber) {
  const room = await Room.create({
    hostelId: hostel._id,
    buildingId,
    floorId: new mongoose.Types.ObjectId(),
    roomNumber: `R-${category}-${bedNumber}`,
    category,
    capacity: 2,
  });
  const bed = await Bed.create({
    hostelId: hostel._id,
    roomId: room._id,
    bedNumber,
    status: 'occupied',
  });
  const resident = await Resident.create({
    hostelId: hostel._id,
    name: `Resident ${bedNumber}`,
    phone: '+920000000',
    registrationNumber: `REG-${bedNumber}`,
    guardian: { name: 'G', phone: '+920000001' },
    status: 'active',
    currentBedId: bed._id,
  });
  return { room, bed, resident };
}

async function setupHostel() {
  const hostel = await Hostel.create({ name: 'Test Hostel', slug: 'test-hostel', timezone: 'UTC' });
  const building = await Building.create({ hostelId: hostel._id, name: 'Block A' });
  return { hostel, building };
}

describe('generateMonthlyInvoices — category-scoped fees', () => {
  it('bills a category-scoped fee only to residents whose current room matches', async () => {
    const { hostel, building } = await setupHostel();
    const { resident: doubleResident } = await makeResidentInRoom(
      hostel,
      building._id,
      'double',
      'A'
    );
    const { resident: singleResident } = await makeResidentInRoom(
      hostel,
      building._id,
      'single',
      'B'
    );

    await FeeStructure.create({
      hostelId: hostel._id,
      name: 'Double Room Rent',
      feeType: 'rent',
      roomCategory: 'double',
      billingCycle: 'monthly',
      amountMinorUnits: 500000,
    });

    const result = await generateMonthlyInvoices({ hostelId: hostel._id.toString() });

    expect(result.created).toBe(1);
    expect(await Invoice.countDocuments({ residentId: doubleResident._id })).toBe(1);
    expect(await Invoice.countDocuments({ residentId: singleResident._id })).toBe(0);
  });

  it('applies a hostel-wide (no-category) fee to every active resident regardless of room', async () => {
    const { hostel, building } = await setupHostel();
    const { resident: r1 } = await makeResidentInRoom(hostel, building._id, 'double', 'A');
    const { resident: r2 } = await makeResidentInRoom(hostel, building._id, 'single', 'B');

    await FeeStructure.create({
      hostelId: hostel._id,
      name: 'Internet',
      feeType: 'utilities',
      billingCycle: 'monthly',
      amountMinorUnits: 20000,
    });

    const result = await generateMonthlyInvoices({ hostelId: hostel._id.toString() });

    expect(result.created).toBe(2);
    expect(await Invoice.countDocuments({ residentId: r1._id })).toBe(1);
    expect(await Invoice.countDocuments({ residentId: r2._id })).toBe(1);
  });

  it('skips a category-scoped fee (and counts it) for an active resident with no current bed, but still bills hostel-wide fees', async () => {
    const { hostel } = await setupHostel();
    const resident = await Resident.create({
      hostelId: hostel._id,
      name: 'No Bed Yet',
      phone: '+920000009',
      registrationNumber: 'REG-NOBED',
      guardian: { name: 'G', phone: '+920000008' },
      status: 'active',
      currentBedId: null,
    });

    await FeeStructure.create({
      hostelId: hostel._id,
      name: 'Double Room Rent',
      feeType: 'rent',
      roomCategory: 'double',
      billingCycle: 'monthly',
      amountMinorUnits: 500000,
    });
    await FeeStructure.create({
      hostelId: hostel._id,
      name: 'Internet',
      feeType: 'utilities',
      billingCycle: 'monthly',
      amountMinorUnits: 20000,
    });

    const result = await generateMonthlyInvoices({ hostelId: hostel._id.toString() });

    expect(result.skippedNoBedForCategoryFee).toBe(1);
    expect(await Invoice.countDocuments({ residentId: resident._id })).toBe(1);
    const invoice = await Invoice.findOne({ residentId: resident._id });
    expect(invoice.items[0].description).toMatch(/Internet/);
  });

  it('is idempotent: running twice for the same month does not double-bill', async () => {
    const { hostel, building } = await setupHostel();
    const { resident } = await makeResidentInRoom(hostel, building._id, 'suite', 'A');
    await FeeStructure.create({
      hostelId: hostel._id,
      name: 'Suite Rent',
      feeType: 'rent',
      roomCategory: 'suite',
      billingCycle: 'monthly',
      amountMinorUnits: 900000,
    });

    await generateMonthlyInvoices({ hostelId: hostel._id.toString() });
    const second = await generateMonthlyInvoices({ hostelId: hostel._id.toString() });

    expect(second.created).toBe(0);
    expect(second.skipped).toBe(1);
    expect(await Invoice.countDocuments({ residentId: resident._id })).toBe(1);
  });
});
