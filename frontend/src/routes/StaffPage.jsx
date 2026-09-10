import { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useStaffList } from '@/features/staff/hooks/useStaff';
import RolesQuickSetup from '@/features/staff/components/RolesQuickSetup.jsx';
import StaffFormModal from '@/features/staff/components/StaffFormModal.jsx';

export default function StaffPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState({ open: false, staff: null });

  const { data, isLoading, isError, error } = useStaffList({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    search: search || undefined,
  });

  const staff = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing staff."
      />
    );
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (row) => row.roleId?.name ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={() => setModalState({ open: true, staff: row })}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Staff"
        description="Manage staff accounts and the roles/permissions they're assigned."
        action={
          <button
            onClick={() => setModalState({ open: true, staff: null })}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> Add Staff
          </button>
        }
      />

      <RolesQuickSetup hostelId={effectiveHostelId} />

      <input
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        placeholder="Search name or email…"
        className="mb-4 w-full max-w-xs rounded-control border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-brand-500"
      />

      <DataTable
        columns={columns}
        rows={staff}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No staff yet"
        emptyDescription="Add a role above, then create your first staff account."
        pagination={pagination}
        onPageChange={setPage}
      />

      <StaffFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, staff: null })}
        hostelId={effectiveHostelId}
        staff={modalState.staff}
      />
    </div>
  );
}