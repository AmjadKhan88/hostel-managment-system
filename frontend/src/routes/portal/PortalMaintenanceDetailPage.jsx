import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { formatMoney } from '@/lib/money';
import { usePortalMaintenanceTicket } from '@/features/portal/hooks/usePortalData';

export default function PortalMaintenanceDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePortalMaintenanceTicket(ticketId);
  const ticket = data?.data?.ticket;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading request…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load request'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate('/portal/maintenance')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Maintenance Requests
      </button>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">{ticket.title}</h1>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="surface-card p-6">
        <p className="text-xs text-ink-subtle">
          Room {ticket.roomId?.roomNumber ?? '—'} · {ticket.category} · Submitted{' '}
          {new Date(ticket.createdAt).toLocaleDateString()}
          {ticket.assignedTo && ` · Technician: ${ticket.assignedTo.name}`}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-muted">{ticket.description}</p>

        {ticket.scheduledDate && (
          <p className="mt-3 text-sm text-ink-muted">
            Scheduled for: <span className="font-medium text-ink">{new Date(ticket.scheduledDate).toLocaleDateString()}</span>
          </p>
        )}
        {ticket.costMinorUnits > 0 && (
          <p className="mt-1 text-sm text-ink-muted">
            Cost: <span className="font-medium text-ink">{formatMoney(ticket.costMinorUnits)}</span>
          </p>
        )}
        {ticket.notes && (
          <div className="mt-3 rounded-control border border-border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Staff notes</p>
            <p className="mt-1 text-sm text-ink-muted">{ticket.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}