import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useAdmissions } from '@/features/admissions/hooks/useAdmissions';
import AdmissionFormModal from '@/features/admissions/components/AdmissionFormModal.jsx';

const STATUSES = ['applied', 'waitlisted', 'approved', 'rejected', 'checked_in', 'cancelled'];

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useAdmissions({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    status: status || undefined,
  });

  const admissions = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing admissions."
      />
    );
  }

  const columns = [
    {
      key: 'resident',
      header: 'Applicant',
      render: (row) => (
        <button
          onClick={() => navigate(`/admissions/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.residentId?.name ?? '—'}
        </button>
      ),
    },
    { key: 'regNo', header: 'Reg. No.', render: (row) => row.residentId?.registrationNumber ?? '—' },
    { key: 'category', header: 'Requested', render: (row) => row.requestedCategory || '—' },
    { key: 'docs', header: 'Documents', render: (row) => (row.documentsVerified ? 'Verified' : 'Pending') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Admissions"
        description="Applications, approvals, and check-in — the front door before Room Allocation."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> New Admission
          </button>
        }
      />

      <select
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
        className="mb-4 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>

      <DataTable
        columns={columns}
        rows={admissions}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No admissions"
        emptyDescription="Start an admission for a pending resident."
        pagination={pagination}
        onPageChange={setPage}
      />

      <AdmissionFormModal open={modalOpen} onClose={() => setModalOpen(false)} hostelId={effectiveHostelId} />
    </div>
  );
}