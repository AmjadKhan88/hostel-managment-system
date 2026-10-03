import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { usePortalComplaints } from '@/features/portal/hooks/usePortalData';
import SubmitComplaintModal from '@/features/portal/components/SubmitComplaintModal.jsx';

export default function PortalComplaintsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, isError, error } = usePortalComplaints({ page, limit: 10 });

  const complaints = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <button
          onClick={() => navigate(`/portal/complaints/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.subject}
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
        <h1 className="text-2xl font-semibold text-ink">My Complaints</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus size={16} /> New Complaint
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={complaints}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No complaints"
        emptyDescription="Submit one if something needs attention."
        pagination={pagination}
        onPageChange={setPage}
      />

      <SubmitComplaintModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}