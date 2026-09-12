import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useNotices, useDeleteNotice } from '@/features/notices/hooks/useNotices';
import NoticeFormModal from '@/features/notices/components/NoticeFormModal.jsx';

const STATUS_STYLES = {
  scheduled: 'bg-warning-bg text-warning',
  published: 'bg-success-bg text-success',
  expired: 'bg-canvas text-ink-subtle',
};

export default function NoticesPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [audience, setAudience] = useState('');
  const [modalState, setModalState] = useState({ open: false, notice: null });
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useNotices({
    hostelId: effectiveHostelId,
    limit: 50,
    audience: audience || undefined,
  });
  const deleteNotice = useDeleteNotice();

  const notices = data?.data?.items ?? [];

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before posting notices."
      />
    );
  }

  const handleConfirmDelete = async () => {
    await deleteNotice.mutateAsync(deleting._id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notices"
        description="Announcements for staff and residents."
        action={
          <button
            onClick={() => setModalState({ open: true, notice: null })}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> New Notice
          </button>
        }
      />

      <select
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        className="mb-4 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        <option value="">All audiences</option>
        <option value="everyone">Everyone</option>
        <option value="staff">Staff</option>
        <option value="residents">Residents</option>
      </select>

      {isLoading && <p className="text-sm text-ink-muted">Loading notices…</p>}

      {!isLoading && notices.length === 0 && (
        <EmptyState title="No notices" description="Post the first announcement for your hostel." />
      )}

      <div className="space-y-3">
        {notices.map((notice) => (
          <article key={notice._id} className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">{notice.title}</h2>
                  <span
                    className={`rounded-pill px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[notice.status]}`}
                  >
                    {notice.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-subtle">
                  {notice.audience} · {new Date(notice.publishAt).toLocaleString()}
                  {notice.expiresAt && ` · expires ${new Date(notice.expiresAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setModalState({ open: true, notice })}
                  className="rounded-control p-1.5 text-ink-muted hover:bg-canvas"
                  aria-label="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleting(notice)}
                  className="rounded-control p-1.5 text-danger hover:bg-danger-bg"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink-muted">{notice.body}</p>
          </article>
        ))}
      </div>

      <NoticeFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, notice: null })}
        hostelId={effectiveHostelId}
        notice={modalState.notice}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        title="Delete notice"
        description={deleting ? `Delete "${deleting.title}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
        isLoading={deleteNotice.isPending}
      />
    </div>
  );
}