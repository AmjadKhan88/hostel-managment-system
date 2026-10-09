import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { startTestDb, stopTestDb, clearTestDb } from '../test/setupTestDb.js';
import { Hostel } from '../models/Hostel.model.js';
import { Resident } from '../models/Resident.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { Payment } from '../models/Payment.model.js';
import {
  invoicePdfForResident,
  receiptPdfForResident,
  invoicePdfForStaff,
} from './documentExport.service.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);

async function setup() {
  const hostel = await Hostel.create({ name: 'Hostel A', slug: 'hostel-a' });
  const otherHostel = await Hostel.create({ name: 'Hostel B', slug: 'hostel-b' });

  const makeResident = (n, h = hostel) =>
    Resident.create({
      hostelId: h._id,
      name: `Resident ${n}`,
      phone: `+92000000${n}`,
      registrationNumber: `REG-${n}`,
      guardian: { name: 'Guardian', phone: '+920000099' },
    });
  const owner = await makeResident(1);
  const neighbour = await makeResident(2);

  const invoice = await Invoice.create({
    hostelId: hostel._id,
    residentId: owner._id,
    invoiceNumber: 'INV-2026-000001',
    items: [{ description: 'Rent', amountMinorUnits: 100000 }],
    totalMinorUnits: 100000,
    dueDate: new Date('2026-12-01'),
  });
  const payment = await Payment.create({
    hostelId: hostel._id,
    invoiceId: invoice._id,
    residentId: owner._id,
    receiptNumber: 'RCPT-2026-000001',
    amountMinorUnits: 50000,
    recordedBy: new mongoose.Types.ObjectId(),
  });

  const auth = (resident, h = hostel) => ({
    id: resident._id.toString(),
    hostelId: h._id.toString(),
  });
  return { hostel, otherHostel, owner, neighbour, invoice, payment, auth };
}

const isPdf = (buffer) => buffer.subarray(0, 5).toString() === '%PDF-';

describe('document export access control', () => {
  it('lets a resident download their own invoice and receipt', async () => {
    const { owner, invoice, payment, auth } = await setup();

    const inv = await invoicePdfForResident(auth(owner), invoice._id);
    const rec = await receiptPdfForResident(auth(owner), payment._id);

    expect(isPdf(inv.buffer)).toBe(true);
    expect(inv.filename).toBe('Invoice-INV-2026-000001.pdf');
    expect(isPdf(rec.buffer)).toBe(true);
    expect(rec.filename).toBe('Receipt-RCPT-2026-000001.pdf');
  });

  it("refuses another resident's invoice and receipt, as a plain not-found", async () => {
    const { neighbour, invoice, payment, auth } = await setup();

    await expect(invoicePdfForResident(auth(neighbour), invoice._id)).rejects.toThrow(/not found/i);
    await expect(receiptPdfForResident(auth(neighbour), payment._id)).rejects.toThrow(/not found/i);
  });

  it('refuses a resident whose token names a different hostel', async () => {
    const { owner, otherHostel, invoice, auth } = await setup();
    await expect(invoicePdfForResident(auth(owner, otherHostel), invoice._id)).rejects.toThrow(
      /not found/i
    );
  });

  it('refuses staff from another hostel', async () => {
    const { otherHostel, invoice } = await setup();
    const staff = {
      id: new mongoose.Types.ObjectId().toString(),
      hostelId: otherHostel._id.toString(),
      permissions: [],
    };

    await expect(invoicePdfForStaff(staff, invoice._id)).rejects.toThrow();
  });
});
