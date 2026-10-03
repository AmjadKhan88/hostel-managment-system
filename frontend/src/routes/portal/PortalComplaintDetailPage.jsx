import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { usePortalComplaint } from '@/features/portal/hooks/usePortalData';

export default function PortalComplaintDetailPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePortalComplaint(complaintId);
  const complaint = data?.data?.complaint;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading complaint…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load complaint'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate('/portal/complaints')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Complaints
      </button>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">{complaint.subject}</h1>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="surface-card p-6">
        <p className="text-xs text-ink-subtle">
          {complaint.category} · Submitted {new Date(complaint.createdAt).toLocaleDateString()}
          {complaint.assignedTo && ` · Assigned to ${complaint.assignedTo.name}`}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-muted">{complaint.description}</p>
      </div>

      {complaint.comments?.length > 0 && (
        <div className="surface-card mt-4 p-6">
          <h2 className="text-sm font-semibold text-ink">Updates</h2>
          <ul className="mt-3 space-y-3">
            {complaint.comments.map((c) => (
              <li key={c._id} className="rounded-control border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{c.authorId?.name ?? 'Staff'}</span>
                  <span className="text-xs text-ink-subtle">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}