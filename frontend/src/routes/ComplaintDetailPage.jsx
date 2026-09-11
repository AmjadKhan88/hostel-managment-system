import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { useComplaint } from '@/features/complaints/hooks/useComplaints';
import { useUpdateComplaint, useAddComment } from '@/features/complaints/hooks/useComplaintMutations';
import { useStaffList } from '@/features/staff/hooks/useStaff';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function ComplaintDetailPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useComplaint(complaintId);
  const updateComplaint = useUpdateComplaint(complaintId);
  const addComment = useAddComment(complaintId);
  const [commentText, setCommentText] = useState('');

  const complaint = data?.data?.complaint;
  const { data: staffData } = useStaffList({ hostelId: complaint?.hostelId, limit: 100 });
  const staff = staffData?.data?.items ?? [];

  if (isLoading) return <p className="text-sm text-ink-muted">Loading complaint…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load complaint'}
      </div>
    );
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment.mutateAsync(commentText.trim());
    setCommentText('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/complaints')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Complaints
      </button>

      <PageHeader
        title={complaint.subject}
        description={`${complaint.category} · Reported ${new Date(complaint.createdAt).toLocaleDateString()}${
          complaint.residentId ? ` by ${complaint.residentId.name}` : ''
        }`}
        action={<StatusBadge status={complaint.status} />}
      />

      <section className="surface-card p-6">
        <h2 className="text-sm font-semibold text-ink">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{complaint.description}</p>
      </section>

      <section className="surface-card mt-4 grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-subtle">Status</label>
          <select
            value={complaint.status}
            onChange={(e) => updateComplaint.mutate({ status: e.target.value })}
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
            value={complaint.priority}
            onChange={(e) => updateComplaint.mutate({ priority: e.target.value })}
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
            Assigned to
          </label>
          <select
            value={complaint.assignedTo?._id ?? ''}
            onChange={(e) => updateComplaint.mutate({ assignedTo: e.target.value || null })}
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
      </section>

      {(complaint.status === 'resolved' || complaint.status === 'closed') && (
        <section className="surface-card mt-4 p-6">
          <h2 className="text-sm font-semibold text-ink">Resolution</h2>
          <textarea
            rows={2}
            defaultValue={complaint.resolutionNotes}
            onBlur={(e) => {
              if (e.target.value !== complaint.resolutionNotes) {
                updateComplaint.mutate({ resolutionNotes: e.target.value });
              }
            }}
            placeholder="What was done to resolve this?"
            className="mt-2 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </section>
      )}

      <section className="surface-card mt-4 p-6">
        <h2 className="text-sm font-semibold text-ink">Comments</h2>

        {complaint.comments.length === 0 && <p className="mt-2 text-sm text-ink-muted">No comments yet.</p>}

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

        <form onSubmit={handleSubmitComment} className="mt-4 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={addComment.isPending}
            className="shrink-0 rounded-control bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            Post
          </button>
        </form>
      </section>
    </div>
  );
}