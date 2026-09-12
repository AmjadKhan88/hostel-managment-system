import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { formatMoney } from '@/lib/money';
import { useInvoices, useOutstandingBalances } from '@/features/fees/hooks/useInvoices';
import FeeStructureQuickSetup from '@/features/fees/components/FeeStructureQuickSetup.jsx';
import InvoiceFormModal from '@/features/fees/components/InvoiceFormModal.jsx';

const STATUSES = ['issued', 'partially_paid', 'paid', 'void'];

export default function FeesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useInvoices({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    status: status || undefined,
  });
  const { data: balancesData } = useOutstandingBalances(effectiveHostelId);

  const invoices = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const balances = balancesData?.data?.balances ?? [];

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing fees."
      />
    );
  }

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (row) => (
        <button
          onClick={() => navigate(`/fees/invoices/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    { key: 'resident', header: 'Resident', render: (row) => row.residentId?.name ?? '—' },
    { key: 'total', header: 'Total', render: (row) => formatMoney(row.totalMinorUnits) },
    { key: 'balance', header: 'Balance', render: (row) => formatMoney(row.totalMinorUnits - row.paidMinorUnits) },
    { key: 'dueDate', header: 'Due', render: (row) => new Date(row.dueDate).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Fees & Payments"
        description="Fee structures, invoices, and payment history."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> New Invoice
          </button>
        }
      />

      <FeeStructureQuickSetup hostelId={effectiveHostelId} />

      {balances.length > 0 && (
        <div className="surface-card mb-4 p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Outstanding balances</h2>
          <ul className="space-y-1.5">
            {balances.slice(0, 5).map((b) => (
              <li key={b.residentId} className="flex justify-between text-sm">
                <span className="text-ink">
                  {b.residentName} <span className="text-xs text-ink-subtle">({b.registrationNumber})</span>
                </span>
                <span className="font-medium text-danger">{formatMoney(b.outstandingMinorUnits)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        rows={invoices}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No invoices"
        emptyDescription="Create the first invoice for a resident."
        pagination={pagination}
        onPageChange={setPage}
      />

      <InvoiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} hostelId={effectiveHostelId} />
    </div>
  );
}