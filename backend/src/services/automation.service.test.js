import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../jobs/queues.js', () => ({
  monthlyInvoiceQueue: { getJob: vi.fn() },
  paymentReminderQueue: { getJob: vi.fn() },
}));

import { monthlyInvoiceQueue } from '../jobs/queues.js';
import { retryJob } from './automation.service.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

function makeJob({ state, hostelId }) {
  return {
    id: 'job-1',
    data: hostelId ? { hostelId } : {},
    getState: vi.fn().mockResolvedValue(state),
    retry: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => vi.clearAllMocks());

describe('retryJob', () => {
  it('lets a super admin retry any failed job, including one with no hostelId', async () => {
    const job = makeJob({ state: 'failed', hostelId: null });
    monthlyInvoiceQueue.getJob.mockResolvedValue(job);
    const user = { hostelId: null, permissions: [SUPER_ADMIN_WILDCARD] };
    await retryJob(user, 'monthly-invoices', 'job-1');
    expect(job.retry).toHaveBeenCalledOnce();
  });

  it('lets hostel-scoped staff retry a job belonging to their OWN hostel', async () => {
    const job = makeJob({ state: 'failed', hostelId: 'hostel-a' });
    monthlyInvoiceQueue.getJob.mockResolvedValue(job);
    const user = { hostelId: 'hostel-a', permissions: ['settings.manage'] };
    await retryJob(user, 'monthly-invoices', 'job-1');
    expect(job.retry).toHaveBeenCalledOnce();
  });

  it("refuses hostel-scoped staff retrying ANOTHER hostel's job", async () => {
    const job = makeJob({ state: 'failed', hostelId: 'hostel-b' });
    monthlyInvoiceQueue.getJob.mockResolvedValue(job);
    const user = { hostelId: 'hostel-a', permissions: ['settings.manage'] };
    await expect(retryJob(user, 'monthly-invoices', 'job-1')).rejects.toThrow(/your own hostel/i);
    expect(job.retry).not.toHaveBeenCalled();
  });

  it('refuses hostel-scoped staff retrying a job with no hostelId (an "all hostels" run)', async () => {
    const job = makeJob({ state: 'failed', hostelId: null });
    monthlyInvoiceQueue.getJob.mockResolvedValue(job);
    const user = { hostelId: 'hostel-a', permissions: ['settings.manage'] };
    await expect(retryJob(user, 'monthly-invoices', 'job-1')).rejects.toThrow(/your own hostel/i);
  });

  it('refuses to retry a job that is not currently failed', async () => {
    const job = makeJob({ state: 'completed', hostelId: 'hostel-a' });
    monthlyInvoiceQueue.getJob.mockResolvedValue(job);
    const user = { hostelId: 'hostel-a', permissions: ['settings.manage'] };
    await expect(retryJob(user, 'monthly-invoices', 'job-1')).rejects.toThrow(/only failed jobs/i);
  });

  it('rejects an unknown queue name before ever touching a job', async () => {
    const user = { hostelId: null, permissions: [SUPER_ADMIN_WILDCARD] };
    await expect(retryJob(user, 'not-a-real-queue', 'job-1')).rejects.toThrow(/unknown queue/i);
    expect(monthlyInvoiceQueue.getJob).not.toHaveBeenCalled();
  });
});
