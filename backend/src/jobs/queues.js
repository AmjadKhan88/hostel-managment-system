import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { Hostel } from '../models/Hostel.model.js';
import { isValidTimeZone } from '../utils/timezone.js';
import { logger } from '../config/logger.js';

const connection = createRedisConnection({ forBullMQ: true });

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: { age: 7 * 24 * 3600 },
  removeOnFail: { age: 30 * 24 * 3600 },
};

export const monthlyInvoiceQueue = new Queue('monthly-invoice-generation', {
  connection,
  defaultJobOptions,
});
export const paymentReminderQueue = new Queue('payment-reminders', {
  connection,
  defaultJobOptions,
});
export const recurringExpenseQueue = new Queue('recurring-expense-generation', {
  connection,
  defaultJobOptions,
});

const MONTHLY_INVOICE_CRON = '0 2 1 * *'; // 02:00 on the 1st, hostel-local time
const RECURRING_EXPENSE_CRON = '0 3 1 * *'; // 03:00 on the 1st — staggered after invoices
const PAYMENT_REMINDER_CRON = '0 9 * * *'; // 09:00 daily, hostel-local time

const monthlyInvoiceSchedulerId = (hostelId) => `generate-monthly-invoices:${hostelId}`;
const recurringExpenseSchedulerId = (hostelId) => `generate-recurring-expenses:${hostelId}`;
const paymentReminderSchedulerId = (hostelId) => `send-payment-reminders:${hostelId}`;

/**
 * Schedules (or re-schedules) one hostel's recurring jobs using ITS OWN
 * timezone. Call whenever a hostel is created or its timezone changes
 * (see hostel.service.js), and for every hostel at worker boot.
 */
export async function upsertHostelJobSchedulers(hostel) {
  const tz = isValidTimeZone(hostel.timezone) ? hostel.timezone : 'UTC';
  if (tz !== hostel.timezone) {
    logger.warn(
      { hostelId: hostel._id, timezone: hostel.timezone },
      'Invalid hostel timezone, scheduling in UTC'
    );
  }

  const hostelId = hostel._id.toString();

  await monthlyInvoiceQueue.upsertJobScheduler(
    monthlyInvoiceSchedulerId(hostelId),
    { pattern: MONTHLY_INVOICE_CRON, tz },
    { name: 'generate-monthly-invoices', data: { hostelId } }
  );

  await recurringExpenseQueue.upsertJobScheduler(
    recurringExpenseSchedulerId(hostelId),
    { pattern: RECURRING_EXPENSE_CRON, tz },
    { name: 'generate-recurring-expenses', data: { hostelId } }
  );

  await paymentReminderQueue.upsertJobScheduler(
    paymentReminderSchedulerId(hostelId),
    { pattern: PAYMENT_REMINDER_CRON, tz },
    { name: 'send-payment-reminders', data: { hostelId } }
  );
}

/** Removes a hostel's schedulers — call when a hostel is deactivated. */
export async function removeHostelJobSchedulers(hostelId) {
  const id = hostelId.toString();
  await monthlyInvoiceQueue.removeJobScheduler(monthlyInvoiceSchedulerId(id));
  await recurringExpenseQueue.removeJobScheduler(recurringExpenseSchedulerId(id));
  await paymentReminderQueue.removeJobScheduler(paymentReminderSchedulerId(id));
}

/** Syncs schedulers for every active hostel. Safe to call repeatedly. */
export async function syncAllHostelSchedulers() {
  const hostels = await Hostel.find({ isActive: true });
  for (const hostel of hostels) {
    await upsertHostelJobSchedulers(hostel);
  }
  logger.info({ hostelCount: hostels.length }, 'Synced per-hostel job schedulers');
  return hostels.length;
}
