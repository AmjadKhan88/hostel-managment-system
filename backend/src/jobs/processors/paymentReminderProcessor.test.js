import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../services/email.service.js', () => ({
  sendEmail: vi.fn(),
  isEmailConfigured: vi.fn(),
}));
vi.mock('../../services/whatsapp.service.js', () => ({
  sendWhatsApp: vi.fn(),
  isWhatsAppConfigured: vi.fn(),
}));
vi.mock('../../events/socketEvents.js', () => ({
  emitToHostel: vi.fn(),
  setSocketServer: vi.fn(),
}));

import { startTestDb, stopTestDb, clearTestDb } from '../../test/setupTestDb.js';
import { Hostel } from '../../models/Hostel.model.js';
import { Resident } from '../../models/Resident.model.js';
import { Invoice } from '../../models/Invoice.model.js';
import { ReminderDelivery } from '../../models/ReminderDelivery.model.js';
import { sendEmail, isEmailConfigured } from '../../services/email.service.js';
import { sendWhatsApp, isWhatsAppConfigured } from '../../services/whatsapp.service.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { sendPaymentReminders } from './paymentReminderProcessor.js';

const DAY_MS = 24 * 60 * 60 * 1000;

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);
beforeEach(() => {
  vi.resetAllMocks();
  isEmailConfigured.mockReturnValue(false);
  isWhatsAppConfigured.mockReturnValue(false);
});

async function createOverdueInvoice() {
  const hostel = await Hostel.create({ name: 'Test Hostel', slug: 'test-hostel' });
  const resident = await Resident.create({
    hostelId: hostel._id,
    name: 'Late Payer',
    email: 'late@example.com',
    phone: '+920000001',
    registrationNumber: 'REG-1',
    guardian: { name: 'Guardian', phone: '+920000002' },
    status: 'active',
  });
  const invoice = await Invoice.create({
    hostelId: hostel._id,
    residentId: resident._id,
    invoiceNumber: 'INV-2026-000001',
    items: [{ description: 'Rent', amountMinorUnits: 100000 }],
    totalMinorUnits: 100000,
    dueDate: new Date(Date.now() - 5 * DAY_MS),
  });
  return { hostel, resident, invoice };
}

function configureBothChannels({ email = { sent: true }, whatsapp = { sent: true } } = {}) {
  isEmailConfigured.mockReturnValue(true);
  isWhatsAppConfigured.mockReturnValue(true);
  sendEmail.mockResolvedValue(email);
  sendWhatsApp.mockResolvedValue(whatsapp);
}

describe('sendPaymentReminders', () => {
  it('does not consume a reminder round while no channel is configured, then sends once configured', async () => {
    const { invoice } = await createOverdueInvoice();

    await sendPaymentReminders();
    await sendPaymentReminders();

    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendWhatsApp).not.toHaveBeenCalled();
    expect(await ReminderDelivery.countDocuments({ invoiceId: invoice._id })).toBe(0);
    expect((await Invoice.findById(invoice._id)).reminderCount).toBe(0);

    configureBothChannels();
    await sendPaymentReminders();

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendWhatsApp).toHaveBeenCalledTimes(1);
    expect((await Invoice.findById(invoice._id)).reminderCount).toBe(1);
  });

  it('does not count failed sends, records the error per channel, and stops retrying at the attempt cap', async () => {
    const { invoice } = await createOverdueInvoice();
    configureBothChannels({
      email: { sent: false, reason: 'send_failed', error: 'smtp down' },
      whatsapp: { sent: false, reason: 'send_failed', error: 'twilio down' },
    });

    for (let i = 0; i < 4; i += 1) await sendPaymentReminders();

    expect(sendEmail).toHaveBeenCalledTimes(3); // 4th run is capped, not retried
    const deliveries = await ReminderDelivery.find({ invoiceId: invoice._id });
    expect(deliveries).toHaveLength(2);
    for (const d of deliveries) {
      expect(d.status).toBe('failed');
      expect(d.attempts).toBe(3);
    }
    expect(deliveries.find((d) => d.channel === 'email').detail).toMatch(/smtp down/);
    expect((await Invoice.findById(invoice._id)).reminderCount).toBe(0);
  });

  it('counts the round when one channel delivers, and keeps the other channel failure visible', async () => {
    const { invoice } = await createOverdueInvoice();
    configureBothChannels({ email: { sent: false, reason: 'send_failed', error: 'smtp down' } });

    await sendPaymentReminders();

    const email = await ReminderDelivery.findOne({ invoiceId: invoice._id, channel: 'email' });
    const whatsapp = await ReminderDelivery.findOne({
      invoiceId: invoice._id,
      channel: 'whatsapp',
    });
    expect(email.status).toBe('failed');
    expect(whatsapp.status).toBe('sent');
    expect(whatsapp.sentAt).not.toBeNull();
    expect((await Invoice.findById(invoice._id)).reminderCount).toBe(1);

    await sendPaymentReminders(); // same day: interval not elapsed, round already consumed
    expect(sendWhatsApp).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('throttles staff notifications and the next resident round to the reminder interval', async () => {
    const { hostel, invoice } = await createOverdueInvoice();
    configureBothChannels();

    await sendPaymentReminders();
    await sendPaymentReminders();

    expect(emitToHostel).toHaveBeenCalledTimes(1);
    expect(emitToHostel).toHaveBeenCalledWith(
      hostel._id.toString(),
      'payment:overdue',
      expect.objectContaining({
        reminder: expect.objectContaining({ state: 'sent', round: 1 }),
      })
    );

    const threeDaysAgo = new Date(Date.now() - 3 * DAY_MS);
    await Invoice.updateOne(
      { _id: invoice._id },
      { $set: { lastStaffOverdueNotifiedAt: threeDaysAgo } }
    );
    await ReminderDelivery.updateMany(
      { invoiceId: invoice._id },
      { $set: { sentAt: threeDaysAgo, lastAttemptAt: threeDaysAgo } }
    );

    await sendPaymentReminders();

    expect(emitToHostel).toHaveBeenCalledTimes(2);
    expect(sendWhatsApp).toHaveBeenCalledTimes(2); // round 2
    expect((await Invoice.findById(invoice._id)).reminderCount).toBe(2);
  });

  it('never resends when a send succeeds but recording the result fails, even after a retry', async () => {
    const { invoice } = await createOverdueInvoice();
    isEmailConfigured.mockReturnValue(true);
    sendEmail.mockResolvedValue({ sent: true });

    const spy = vi
      .spyOn(ReminderDelivery, 'updateOne')
      .mockRejectedValueOnce(new Error('db went away'));
    try {
      await expect(sendPaymentReminders()).rejects.toThrow(/invoice error/i);
    } finally {
      spy.mockRestore();
    }

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const stuck = await ReminderDelivery.findOne({ invoiceId: invoice._id, channel: 'email' });
    expect(stuck.status).toBe('pending');

    await sendPaymentReminders(); // the BullMQ-style retry
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('turns a stale pending claim into unknown, counts the round, and still never resends', async () => {
    const { hostel, resident, invoice } = await createOverdueInvoice();
    isEmailConfigured.mockReturnValue(true);
    sendEmail.mockResolvedValue({ sent: true });

    await ReminderDelivery.create({
      hostelId: hostel._id,
      invoiceId: invoice._id,
      residentId: resident._id,
      round: 1,
      channel: 'email',
      status: 'pending',
      attempts: 1,
      lastAttemptAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    await sendPaymentReminders();

    expect(sendEmail).not.toHaveBeenCalled();
    const record = await ReminderDelivery.findOne({ invoiceId: invoice._id, channel: 'email' });
    expect(record.status).toBe('unknown');
    expect((await Invoice.findById(invoice._id)).reminderCount).toBe(1);
  });
});
