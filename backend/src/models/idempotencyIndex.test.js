import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { startTestDb, stopTestDb, clearTestDb } from '../test/setupTestDb.js';
import { Expense } from './Expense.model.js';
import { Invoice } from './Invoice.model.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);

describe('idempotencyKey unique indexes', () => {
  it('lets a hostel record many expenses that have no idempotency key', async () => {
    const base = {
      hostelId: new mongoose.Types.ObjectId(),
      title: 'Bill',
      category: 'electricity',
      amountMinorUnits: 1000,
    };

    await Expense.create(base);
    await expect(Expense.create(base)).resolves.toBeDefined();
    await expect(Expense.create(base)).resolves.toBeDefined();
  });

  it('still rejects two expenses that share the same idempotency key', async () => {
    const base = {
      hostelId: new mongoose.Types.ObjectId(),
      title: 'Rent',
      category: 'rent',
      amountMinorUnits: 1000,
      idempotencyKey: 'monthly-expense:abc:2026-10',
    };

    await Expense.create(base);
    await expect(Expense.create(base)).rejects.toMatchObject({ code: 11000 });
  });

  it('lets a hostel create many manual invoices, but still blocks a repeated automation key', async () => {
    const hostelId = new mongoose.Types.ObjectId();
    const residentId = new mongoose.Types.ObjectId();
    const make = (n, extra = {}) =>
      Invoice.create({
        hostelId,
        residentId,
        invoiceNumber: `INV-${n}`,
        items: [{ description: 'Rent', amountMinorUnits: 1000 }],
        totalMinorUnits: 1000,
        dueDate: new Date(),
        ...extra,
      });

    await make(1);
    await make(2);
    await make(3, { idempotencyKey: 'monthly:r:f:2026-10' });
    await expect(make(4, { idempotencyKey: 'monthly:r:f:2026-10' })).rejects.toMatchObject({
      code: 11000,
    });
  });
});
