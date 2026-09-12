import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { useMaintenanceTicket } from '@/features/maintenance/hooks/useMaintenance';
import { useUpdateMaintenanceTicket } from '@/features/maintenance/hooks/useMaintenanceMutations';
import { useStaffList } from '@/features/staff/hooks/useStaff';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function MaintenanceDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useMaintenanceTicket(ticketId);
  const updateTicket = useUpdateMaintenanceTicket(ticketId);

  const ticket = data?.data?.ticket;
  const { data: staffData } = useStaffList({ hostelId: ticket?.hostelId, limit: 100 });
  const staff = staffData?.data?.items ?? [];

  if (isLoading) return <p className="text-sm text-ink-muted">Loading ticket…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load ticket'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/maintenance')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Maintenance
      </button>

      <PageHeader
        title={ticket.title}
        description={`Room ${ticket.roomId?.roomNumber ?? '—'} · ${ticket.category} · Logged ${new Date(
          ticket.createdAt
        ).toLocaleDateString()}`}
        action={<StatusBadge status={ticket.status} />}
      />

      <section className="surface-card p-6">
        <h2 className="text-sm font-semibold text-ink">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{ticket.description}</p>
      </section>

      <section className="surface-card mt-4 grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">Status</label>
          <select
            value={ticket.status}
            onChange={(e) => updateTicket.mutate({ status: e.target.value })}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">Priority</label>
          <select
            value={ticket.priority}
            onChange={(e) => updateTicket.mutate({ priority: e.target.value })}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Technician
          </label>
          <select
            value={ticket.assignedTo?._id ?? ''}
            onChange={(e) => updateTicket.mutate({ assignedTo: e.target.value || null })}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Scheduled date
          </label>
          <input
            type="date"
            defaultValue={ticket.scheduledDate ? ticket.scheduledDate.slice(0, 10) : ''}
            onChange={(e) => updateTicket.mutate({ scheduledDate: e.target.value || null })}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">Cost</label>
          <input
            type="number"
            min={0}
            step="0.01"
            defaultValue={(ticket.costMinorUnits / 100).toFixed(2)}
            onBlur={(e) => {
              const minorUnits = Math.round(Number(e.target.value || 0) * 100);
              if (minorUnits !== ticket.costMinorUnits) {
                updateTicket.mutate({ costMinorUnits: minorUnits });
              }
            }}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </section>

      <section className="surface-card mt-4 p-6">
        <h2 className="text-sm font-semibold text-ink">Notes</h2>
        <textarea
          rows={3}
          defaultValue={ticket.notes}
          onBlur={(e) => {
            if (e.target.value !== ticket.notes) {
              updateTicket.mutate({ notes: e.target.value });
            }
          }}
          placeholder="Work log, parts used, follow-ups…"
          className="mt-2 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </section>
    </div>
  );
}