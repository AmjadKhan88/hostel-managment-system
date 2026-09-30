import { useState } from 'react';
import { RefreshCw, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useAutomationStatus, useRetryJob, useTriggerJob } from '@/features/automation/hooks/useAutomation';

const QUEUE_LABELS = {
  'monthly-invoices': 'Monthly Invoice Generation',
  'payment-reminders': 'Payment Reminders',
};

export default function AutomationPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const { data, isLoading } = useAutomationStatus(effectiveHostelId);
  const retryJob = useRetryJob(effectiveHostelId);
  const triggerJob = useTriggerJob(effectiveHostelId);
  const [retryingId, setRetryingId] = useState(null);

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before viewing automation."
      />
    );
  }

  if (isLoading || !data?.data) return <p className="text-sm text-ink-muted">Loading automation status…</p>;

  const { worker, queues } = data.data;

  const handleRetry = async (queueName, jobId) => {
    setRetryingId(jobId);
    try {
      await retryJob.mutateAsync({ queue: queueName, jobId });
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Automation" description="Scheduled job status, run history, and manual controls." />

      <div
        className={`mb-4 flex flex-wrap items-center gap-2 rounded-control border px-4 py-3 text-sm ${worker.alive ? 'border-success bg-success-bg text-success' : 'border-danger bg-danger-bg text-danger'
          }`}
      >
        {worker.alive ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        <span className="font-medium">{worker.alive ? 'Worker process is running' : 'No worker process detected'}</span>
        <span className="text-xs opacity-80">
          {worker.lastSeenAt ? `Last heartbeat: ${new Date(worker.lastSeenAt).toLocaleString()}` : 'No heartbeat recorded yet'}
        </span>
      </div>

      {!worker.alive && (
        <div className="mb-4 rounded-control border border-warning bg-warning-bg px-4 py-3 text-sm text-warning">
          Scheduled jobs (monthly invoices, payment reminders) will NOT run until a worker process is started — run{' '}
          <code className="rounded bg-canvas px-1">npm run worker</code> alongside the API server. See{' '}
          <code className="rounded bg-canvas px-1">docs/DEPLOYMENT.md</code> for running it persistently in production.
        </div>
      )}

      {Object.entries(queues).map(([queueName, queueData]) => (
        <div key={queueName} className="surface-card mb-4 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">{QUEUE_LABELS[queueName] ?? queueName}</h2>
            <button
              onClick={() => triggerJob.mutate({ type: queueName })}
              disabled={triggerJob.isPending}
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas disabled:opacity-50"
            >
              <Play size={13} /> Run now
            </button>
          </div>

          <div className="mb-3 grid grid-cols-5 gap-2 text-center text-xs">
            {Object.entries(queueData.counts).map(([status, count]) => (
              <div key={status} className="rounded-control border border-border py-2">
                <p className="text-lg font-semibold text-ink">{count}</p>
                <p className="capitalize text-ink-subtle">{status}</p>
              </div>
            ))}
          </div>

          {queueData.schedulers.length > 0 && (
            <p className="mb-3 text-xs text-ink-subtle">
              Next scheduled run:{' '}
              {queueData.schedulers[0].next ? new Date(queueData.schedulers[0].next).toLocaleString() : 'unknown'}
              {queueData.schedulers[0].tz && ` (${queueData.schedulers[0].tz})`}
            </p>
          )}

          {queueData.recentFailed.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-danger">Recent failures</p>
              <ul className="space-y-1.5">
                {queueData.recentFailed.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between rounded-control border border-danger/30 bg-danger-bg px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-medium text-danger">
                        {job.finishedOn ? new Date(job.finishedOn).toLocaleString() : 'Unknown time'}
                      </p>
                      <p className="text-danger/80">{job.failedReason}</p>
                    </div>
                    <button
                      onClick={() => handleRetry(queueName, job.id)}
                      disabled={retryingId === job.id}
                      className="flex shrink-0 items-center gap-1 rounded-control border border-danger px-2 py-1 font-medium text-danger hover:bg-danger hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">Recent runs</p>
            {queueData.recentCompleted.length === 0 ? (
              <p className="text-xs text-ink-subtle">No completed runs yet.</p>
            ) : (
              <ul className="space-y-1">
                {queueData.recentCompleted.slice(0, 5).map((job) => (
                  <li key={job.id} className="flex justify-between text-xs text-ink-muted">
                    <span>{job.finishedOn ? new Date(job.finishedOn).toLocaleString() : '—'}</span>
                    <span className="text-ink-subtle">{job.returnvalue ? JSON.stringify(job.returnvalue) : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}