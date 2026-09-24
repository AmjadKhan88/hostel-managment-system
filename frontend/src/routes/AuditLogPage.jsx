import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs';

const ACTIONS = [
  'auth.login',
  'auth.login_failed',
  'resident.created',
  'resident.updated',
  'role.updated',
  'settings.updated',
  'invoice.generated',
  'invoice.voided',
  'payment.recorded',
  'payment.refunded',
  'allocation.assigned',
  'allocation.transferred',
  'allocation.checked_out',
];

export default function AuditLogPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');

  const { data, isLoading, isError, error } = useAuditLogs({
    hostelId: effectiveHostelId,
    page,
    limit: 25,
    action: action || undefined,
  });

  const logs = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before viewing the audit log."
      />
    );
  }

  const columns = [
    { key: 'action', header: 'Action', render: (row) => row.action.replace(/[._]/g, ' ') },
    { key: 'entityType', header: 'Entity', render: (row) => row.entityType || '—' },
    { key: 'actor', header: 'Actor', render: (row) => row.actorId?.name ?? row.actorName ?? 'Unknown' },
    { key: 'when', header: 'When', render: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Audit Log" description="A record of important actions taken across this hostel." />

      <select
        value={action}
        onChange={(e) => {
          setPage(1);
          setAction(e.target.value);
        }}
        className="mb-4 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        <option value="">All actions</option>
        {ACTIONS.map((a) => (
          <option key={a} value={a}>
            {a.replace(/[._]/g, ' ')}
          </option>
        ))}
      </select>

      <DataTable
        columns={columns}
        rows={logs}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No audit entries"
        emptyDescription="Nothing logged yet for this filter."
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}