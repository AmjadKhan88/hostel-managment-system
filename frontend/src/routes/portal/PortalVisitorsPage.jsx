import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { usePortalVisitors, useCancelPortalVisitor } from '@/features/portal/hooks/usePortalData';
import PreRegisterVisitorModal from '@/features/portal/components/PreRegisterVisitorModal.jsx';

export default function PortalVisitorsPage() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const { data, isLoading, isError, error } = usePortalVisitors({ page, limit: 10 });
  const cancelVisitor = useCancelPortalVisitor();

  const visitors = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const columns = [
    { key: 'visitorName', header: 'Visitor' },
    { key: 'phone', header: 'Phone' },
    { key: 'purpose', header: 'Purpose', render: (row) => row.purpose || '—' },
    {
      key: 'when',
      header: 'Expected / Visited',
      render: (row) =>
        row.checkInAt
          ? new Date(row.checkInAt).toLocaleString()
          : row.expectedAt
            ? new Date(row.expectedAt).toLocaleString()
            : '—',
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'expected' && (
          <button
            onClick={() => setCancelling(row)}
            className="flex items-center gap-1 text-sm font-medium text-danger hover:underline"
          >
            <X size={14} /> Cancel
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">My Visitors</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus size={16} /> Pre-Register a Visitor
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={visitors}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No visitors"
        emptyDescription="Pre-register someone so the gate knows to expect them."
        pagination={pagination}
        onPageChange={setPage}
      />

      <PreRegisterVisitorModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={async () => {
          await cancelVisitor.mutateAsync(cancelling._id);
          setCancelling(null);
        }}
        title="Cancel pre-registration"
        description={cancelling ? `Cancel the expected visit from ${cancelling.visitorName}?` : ''}
        confirmLabel="Cancel visit"
        danger
        isLoading={cancelVisitor.isPending}
      />
    </div>
  );
}