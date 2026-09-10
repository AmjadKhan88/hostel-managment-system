import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useResidents } from '@/features/residents/hooks/useResidents';
import ResidentFormModal from '@/features/residents/components/ResidentFormModal.jsx';

const RESIDENT_STATUSES = ['pending', 'active', 'checked_out'];

export default function ResidentsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useResidents({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
  });

  const residents = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing residents."
      />
    );
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <button
          onClick={() => navigate(`/residents/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.name}
        </button>
      ),
    },
    { key: 'registrationNumber', header: 'Reg. No.' },
    { key: 'phone', header: 'Phone' },
    { key: 'institution', header: 'Institution', render: (row) => row.institution || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Residents"
        description="Manage resident profiles and guardian/emergency contacts."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> Add Resident
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name, phone, email, reg. no…"
          className="w-full max-w-xs rounded-control border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All statuses</option>
          {RESIDENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={residents}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No residents yet"
        emptyDescription="Add your first resident to get started."
        pagination={pagination}
        onPageChange={setPage}
      />

      <ResidentFormModal open={modalOpen} onClose={() => setModalOpen(false)} hostelId={effectiveHostelId} resident={null} />
    </div>
  );
}