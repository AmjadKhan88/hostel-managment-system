import { useState } from 'react';
import { UserPlus2, LogOut } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useVisitors, useCheckOutVisitor } from '@/features/visitors/hooks/useVisitors';
import VisitorCheckInModal from '@/features/visitors/components/VisitorCheckInModal.jsx';

export default function VisitorsPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('inside');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);

  const { data, isLoading, isError, error } = useVisitors({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    status: status || undefined,
    search: search || undefined,
  });
  const checkOut = useCheckOutVisitor();

  const visitors = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing visitors."
      />
    );
  }

  const handleConfirmCheckout = async () => {
    await checkOut.mutateAsync(checkingOut._id);
    setCheckingOut(null);
  };

  const columns = [
    { key: 'visitorName', header: 'Visitor' },
    { key: 'phone', header: 'Phone' },
    { key: 'resident', header: 'Visiting', render: (row) => row.residentId?.name ?? '—' },
    { key: 'purpose', header: 'Purpose', render: (row) => row.purpose || '—' },
    { key: 'checkInAt', header: 'Checked in', render: (row) => new Date(row.checkInAt).toLocaleString() },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.checkOutAt ? (
          <span className="text-xs text-ink-subtle">
            Checked out {new Date(row.checkOutAt).toLocaleTimeString()}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-pill bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
            Inside
          </span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        !row.checkOutAt && (
          <button
            onClick={() => setCheckingOut(row)}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <LogOut size={14} /> Check out
          </button>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Visitors"
        description="Gate log — who's currently on site and visit history."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <UserPlus2 size={16} /> Check In Visitor
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
          placeholder="Search visitor name or phone…"
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
          <option value="inside">Currently inside</option>
          <option value="checked_out">Checked out</option>
          <option value="">All</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={visitors}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No visitors"
        emptyDescription="No visitor records match these filters."
        pagination={pagination}
        onPageChange={setPage}
      />

      <VisitorCheckInModal open={modalOpen} onClose={() => setModalOpen(false)} hostelId={effectiveHostelId} />

      <ConfirmDialog
        open={Boolean(checkingOut)}
        onClose={() => setCheckingOut(null)}
        onConfirm={handleConfirmCheckout}
        title="Check out visitor"
        description={checkingOut ? `Confirm ${checkingOut.visitorName} has left the premises.` : ''}
        confirmLabel="Check out"
        isLoading={checkOut.isPending}
      />
    </div>
  );
}