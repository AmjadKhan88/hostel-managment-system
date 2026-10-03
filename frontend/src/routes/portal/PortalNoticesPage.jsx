import { useState } from 'react';
import { usePortalNotices } from '@/features/portal/hooks/usePortalData';

export default function PortalNoticesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePortalNotices({ page, limit: 20 });
  const notices = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Notices</h1>

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!isLoading && notices.length === 0 && <p className="text-sm text-ink-muted">No notices right now.</p>}

      <div className="space-y-3">
        {notices.map((n) => (
          <article key={n._id} className="surface-card p-5">
            <h2 className="text-sm font-semibold text-ink">{n.title}</h2>
            <p className="mt-1 text-xs text-ink-subtle">{new Date(n.publishAt).toLocaleString()}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink-muted">{n.body}</p>
          </article>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-control border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 py-1.5 text-ink-muted">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="rounded-control border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}