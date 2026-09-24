import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';

const connection = createRedisConnection({ forBullMQ: true });

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: { age: 7 * 24 * 3600 }, // keep 7 days for job monitoring
  removeOnFail: { age: 30 * 24 * 3600 },
};

export const monthlyInvoiceQueue = new Queue('monthly-invoice-generation', { connection, defaultJobOptions });
export const paymentReminderQueue = new Queue('payment-reminders', { connection, defaultJobOptions });

/**
 * Uses BullMQ's modern Job Scheduler API (upsertJobScheduler) rather than
 * the deprecated repeatable-jobs API, per the master spec. "Upsert" means
 * calling this on every worker boot is safe — it won't create duplicate
 * schedules.
 */
export async function scheduleRecurringJobs() {
  await monthlyInvoiceQueue.upsertJobScheduler(
    'generate-monthly-invoices',
    { pattern: '0 2 1 * *' }, // 02:00 on the 1st of every month
    { name: 'generate-monthly-invoices', data: {} }
  );

  await paymentReminderQueue.upsertJobScheduler(
    'send-payment-reminders',
    { pattern: '0 9 * * *' }, // 09:00 every day
    { name: 'send-payment-reminders', data: {} }
  );
}