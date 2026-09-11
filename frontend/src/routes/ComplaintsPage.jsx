import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useComplaints } from '@/features/complaints/hooks/useComplaints';
import ComplaintFormModal from '@/features/complaints/components/ComplaintFormModal.jsx';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const PRIORITY_STYLES = {
  low: 'text-ink-muted',
  medium: 'text-ink',
  high: 'text-warning',
  urgent: 'text-danger',
};

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useComplaints({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    status: status || undefined,
    priority: priority || undefined,
  });

  const complaints = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing complaints."
      />
    );
  }

  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <button
          onClick={() => navigate(`/complaints/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.subject}
        </button>
      ),
    },
    { key: 'category', header: 'Category' },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <span className={`text-sm font-medium capitalize ${PRIORITY_STYLES[row.priority]}`}>{row.priority}</span>
      ),
    },
    { key: 'assignedTo', header: 'Assigned to', render: (row) => row.assignedTo?.name ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Complaints"
        description="Track and resolve resident and facility complaints."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> New Complaint
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPage(1);
            setPriority(e.target.value);
          }}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={complaints}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No complaints"
        emptyDescription="Nothing logged yet — add the first one."
        pagination={pagination}
        onPageChange={setPage}
      />

      <ComplaintFormModal open={modalOpen} onClose={() => setModalOpen(false)} hostelId={effectiveHostelId} />
    </div>
  );
}