import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { usePortalComplaint, useAddComplaintComment } from '@/features/portal/hooks/usePortalData';

export default function PortalComplaintDetailPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePortalComplaint(complaintId);
  const addComment = useAddComplaintComment(complaintId);
  const [text, setText] = useState('');
  const complaint = data?.data?.complaint;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading complaint…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load complaint'}
      </div>
    );
  }

  const isClosed = complaint.status === 'closed';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate(text.trim(), { onSuccess: () => setText('') });
  };

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

      <div className="surface-card mt-4 p-6">
        <h2 className="text-sm font-semibold text-ink">Conversation</h2>

        {(complaint.comments?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-ink-muted">No replies yet.</p>
        )}

        <ul className="mt-3 space-y-3">
          {complaint.comments?.map((c) => {
            const mine = Boolean(c.residentId);
            return (
              <li
                key={c._id}
                className={`rounded-control border p-3 ${mine ? 'border-brand-100 bg-brand-50' : 'border-border'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{mine ? 'You' : (c.authorId?.name ?? 'Staff')}</span>
                  <span className="text-xs text-ink-subtle">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">{c.text}</p>
              </li>
            );
          })}
        </ul>

        {isClosed ? (
          <p className="mt-4 text-sm text-ink-subtle">
            This complaint is closed. If the problem continues, submit a new complaint.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              placeholder="Add a reply or more details…"
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
            />
            {addComment.isError && <p className="text-sm text-danger">{addComment.error.message}</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-subtle">{text.length}/1000</span>
              <button
                type="submit"
                disabled={!text.trim() || addComment.isPending}
                className="rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addComment.isPending ? 'Sending…' : 'Send reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}