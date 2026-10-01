import {
  monthlyInvoiceQueue,
  paymentReminderQueue,
  recurringExpenseQueue,
} from '../jobs/queues.js';
import { getWorkerHeartbeat } from '../jobs/heartbeat.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

const QUEUES = {
  'monthly-invoices': monthlyInvoiceQueue,
  'payment-reminders': paymentReminderQueue,
  'recurring-expenses': recurringExpenseQueue,
};

function getQueue(name) {
  const queue = QUEUES[name];
  if (!queue) throw ApiError.badRequest(`Unknown queue: ${name}`);
  return queue;
}

function toJobSummary(job) {
  return {
    id: job.id,
    name: job.name,
    hostelId: job.data?.hostelId ?? null,
    finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
    attemptsMade: job.attemptsMade,
    returnvalue: job.returnvalue ?? null,
    failedReason: job.failedReason ?? null,
  };
}

async function summarizeQueue(queue, hostelId) {
  const [counts, completed, failed, schedulers] = await Promise.all([
    queue.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed'),
    queue.getJobs(['completed'], 0, 30, false),
    queue.getJobs(['failed'], 0, 30, false),
    queue.getJobSchedulers(),
  ]);

  const filterByHostel = (jobs) =>
    hostelId ? jobs.filter((j) => j.data?.hostelId === hostelId) : jobs;
  const relevantSchedulers = hostelId
    ? schedulers.filter((s) => s.id?.endsWith(`:${hostelId}`))
    : schedulers;

  return {
    counts,
    schedulers: relevantSchedulers.map((s) => ({
      id: s.id,
      pattern: s.pattern,
      tz: s.tz ?? null,
      next: s.next ? new Date(s.next) : null,
    })),
    recentCompleted: filterByHostel(completed).slice(0, 10).map(toJobSummary),
    recentFailed: filterByHostel(failed).slice(0, 10).map(toJobSummary),
  };
}

export async function getAutomationStatus(user, hostelId) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);

  const [monthlyInvoices, paymentReminders, recurringExpenses, worker] = await Promise.all([
    summarizeQueue(monthlyInvoiceQueue, resolvedHostelId),
    summarizeQueue(paymentReminderQueue, resolvedHostelId),
    summarizeQueue(recurringExpenseQueue, resolvedHostelId),
    getWorkerHeartbeat(),
  ]);

  return {
    worker,
    queues: {
      'monthly-invoices': monthlyInvoices,
      'payment-reminders': paymentReminders,
      'recurring-expenses': recurringExpenses,
    },
  };
}

export async function retryJob(user, queueName, jobId) {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);
  if (!job) throw ApiError.notFound('Job not found');

  const state = await job.getState();
  if (state !== 'failed') {
    throw ApiError.badRequest(`Only failed jobs can be retried (current state: ${state})`);
  }

  const isSuperAdmin = user.permissions.includes(SUPER_ADMIN_WILDCARD);
  if (!isSuperAdmin && (!job.data?.hostelId || job.data.hostelId !== user.hostelId)) {
    throw ApiError.forbidden('You can only retry jobs for your own hostel');
  }

  await job.retry();
  return { jobId: job.id, queue: queueName };
}
