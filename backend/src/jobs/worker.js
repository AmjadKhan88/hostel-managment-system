import 'dotenv/config';
import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { connectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { generateMonthlyInvoices } from './processors/monthlyInvoiceProcessor.js';
import { sendPaymentReminders } from './processors/paymentReminderProcessor.js';
import { scheduleRecurringJobs } from './queues.js';

async function bootstrap() {
  await connectDB();
  const connection = createRedisConnection({ forBullMQ: true });

  const monthlyInvoiceWorker = new Worker('monthly-invoice-generation', () => generateMonthlyInvoices(), {
    connection,
  });
  const paymentReminderWorker = new Worker('payment-reminders', () => sendPaymentReminders(), { connection });

  for (const worker of [monthlyInvoiceWorker, paymentReminderWorker]) {
    worker.on('completed', (job) => logger.info({ jobId: job.id, queue: job.queueName }, 'Job completed'));
    worker.on('failed', (job, err) => logger.error({ jobId: job?.id, queue: job?.queueName, err }, 'Job failed'));
  }

  await scheduleRecurringJobs();
  logger.info('🛠️  Worker process started — monthly invoices and payment reminders scheduled');

  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT', () => process.exit(0));
}

bootstrap();