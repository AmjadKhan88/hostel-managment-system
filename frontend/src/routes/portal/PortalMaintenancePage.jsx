import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { usePortalMaintenanceTickets } from '@/features/portal/hooks/usePortalData';
import SubmitMaintenanceModal from '@/features/portal/components/SubmitMaintenanceModal.jsx';

export default function PortalMaintenancePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, isError, error } = usePortalMaintenanceTickets({ page, limit: 10 });

  const tickets = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: 'title',
      header: 'Request',
      render: (row) => (
        <button
          onClick={() => navigate(`/portal/maintenance/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.title}
        </button>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Submitted', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Maintenance Requests</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={tickets}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No maintenance requests"
        emptyDescription="Submit one if something in your room needs fixing."
        pagination={pagination}
        onPageChange={setPage}
      />

      <SubmitMaintenanceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}