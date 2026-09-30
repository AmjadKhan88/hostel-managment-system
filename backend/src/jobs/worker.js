import 'dotenv/config';
import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { connectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { generateMonthlyInvoices } from './processors/monthlyInvoiceProcessor.js';
import { sendPaymentReminders } from './processors/paymentReminderProcessor.js';
import { syncAllHostelSchedulers } from './queues.js';
import { startWorkerHeartbeat } from './heartbeat.js';

async function bootstrap() {
  await connectDB();
  const connection = createRedisConnection({ forBullMQ: true });

  const monthlyInvoiceWorker = new Worker(
    'monthly-invoice-generation',
    (job) => generateMonthlyInvoices(job.data),
    {
      connection,
    }
  );
  const paymentReminderWorker = new Worker(
    'payment-reminders',
    (job) => sendPaymentReminders(job.data),
    {
      connection,
    }
  );

  for (const worker of [monthlyInvoiceWorker, paymentReminderWorker]) {
    worker.on('completed', (job) =>
      logger.info(
        { jobId: job.id, queue: job.queueName, hostelId: job.data?.hostelId },
        'Job completed'
      )
    );
    worker.on('failed', (job, err) =>
      logger.error(
        { jobId: job?.id, queue: job?.queueName, hostelId: job?.data?.hostelId, err },
        'Job failed'
      )
    );
  }

  const hostelCount = await syncAllHostelSchedulers();
  const stopHeartbeat = startWorkerHeartbeat();
  logger.info(
    { hostelCount },
    '🛠️  Worker process started — schedulers synced, heartbeat active (Automation admin page will show this worker as alive)'
  );

  const shutdown = async (signal) => {
    logger.info(`${signal} received — worker shutting down`);
    stopHeartbeat();
    await Promise.all([monthlyInvoiceWorker.close(), paymentReminderWorker.close()]);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
