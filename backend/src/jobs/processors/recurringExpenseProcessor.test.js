import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';

vi.mock('../../events/socketEvents.js', () => ({
  emitToHostel: vi.fn(),
  setSocketServer: vi.fn(),
}));

import { startTestDb, stopTestDb, clearTestDb } from '../../test/setupTestDb.js';
import { Hostel } from '../../models/Hostel.model.js';
import { Expense } from '../../models/Expense.model.js';
import { generateRecurringExpenses } from './recurringExpenseProcessor.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function setupHostel() {
  return Hostel.create({ name: 'Test Hostel', slug: 'test-hostel', timezone: 'UTC' });
}

describe('generateRecurringExpenses', () => {
  it("generates this month's instance for a series whose latest entry is still monthly", async () => {
    const hostel = await setupHostel();
    const original = await Expense.create({
      hostelId: hostel._id,
      title: 'Staff salaries',
      category: 'salary',
      amountMinorUnits: 1000000,
      recurrence: 'monthly',
      incurredAt: monthsAgo(1),
    });

    const result = await generateRecurringExpenses({ hostelId: hostel._id.toString() });

    expect(result.created).toBe(1);
    const all = await Expense.find({ seriesId: original.seriesId }).sort({ incurredAt: 1 });
    expect(all).toHaveLength(2);
    expect(all[1].amountMinorUnits).toBe(1000000);
    expect(all[1].recordedBy).toBeNull();
  });

  it('copies the amount from the MOST RECENT instance, not the original', async () => {
    const hostel = await setupHostel();
    const original = await Expense.create({
      hostelId: hostel._id,
      title: 'Electricity',
      category: 'electricity',
      amountMinorUnits: 100000,
      recurrence: 'monthly',
      incurredAt: monthsAgo(2),
    });
    await Expense.create({
      hostelId: hostel._id,
      title: 'Electricity',
      category: 'electricity',
      amountMinorUnits: 150000, // last month's bill was higher — user edited it
      recurrence: 'monthly',
      seriesId: original.seriesId,
      incurredAt: monthsAgo(1),
    });

    await generateRecurringExpenses({ hostelId: hostel._id.toString() });

    const latest = await Expense.find({ seriesId: original.seriesId }).sort({ incurredAt: -1 });
    expect(latest[0].amountMinorUnits).toBe(150000);
  });

  it('does NOT generate when the latest instance was switched back to one_time', async () => {
    const hostel = await setupHostel();
    const original = await Expense.create({
      hostelId: hostel._id,
      title: 'Wifi',
      category: 'internet',
      amountMinorUnits: 20000,
      recurrence: 'monthly',
      incurredAt: monthsAgo(2),
    });
    await Expense.create({
      hostelId: hostel._id,
      title: 'Wifi',
      category: 'internet',
      amountMinorUnits: 20000,
      recurrence: 'one_time', // cancelled
      seriesId: original.seriesId,
      incurredAt: monthsAgo(1),
    });

    const result = await generateRecurringExpenses({ hostelId: hostel._id.toString() });

    expect(result.created).toBe(0);
    expect(await Expense.countDocuments({ seriesId: original.seriesId })).toBe(2);
  });

  it('does not immediately duplicate a series created this same month', async () => {
    const hostel = await setupHostel();
    await Expense.create({
      hostelId: hostel._id,
      title: 'Rent',
      category: 'rent',
      amountMinorUnits: 300000,
      recurrence: 'monthly',
      incurredAt: new Date(),
    });

    const result = await generateRecurringExpenses({ hostelId: hostel._id.toString() });
    expect(result.created).toBe(0);
  });

  it('is idempotent: running twice in the same month does not double-generate', async () => {
    const hostel = await setupHostel();
    await Expense.create({
      hostelId: hostel._id,
      title: 'Technical support',
      category: 'technical',
      amountMinorUnits: 50000,
      recurrence: 'monthly',
      incurredAt: monthsAgo(1),
    });

    await generateRecurringExpenses({ hostelId: hostel._id.toString() });
    const second = await generateRecurringExpenses({ hostelId: hostel._id.toString() });

    expect(second.created).toBe(0);
    expect(second.skipped).toBe(1);
  });
});
