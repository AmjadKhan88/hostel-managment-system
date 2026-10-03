import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { formatMoney } from '@/lib/money';
import { usePortalInvoices } from '@/features/portal/hooks/usePortalData';

export default function PortalInvoicesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = usePortalInvoices({ page, limit: 10 });

  const invoices = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (row) => (
        <button
          onClick={() => navigate(`/portal/invoices/${row._id}`)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    { key: 'total', header: 'Total', render: (row) => formatMoney(row.totalMinorUnits) },
    { key: 'balance', header: 'Balance', render: (row) => formatMoney(row.totalMinorUnits - row.paidMinorUnits) },
    { key: 'dueDate', header: 'Due', render: (row) => new Date(row.dueDate).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Invoices</h1>
      <DataTable
        columns={columns}
        rows={invoices}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No invoices yet"
        emptyDescription="Invoices will appear here once issued."
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}