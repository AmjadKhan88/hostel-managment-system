import { useState } from 'react';
import DataTable from '@/components/ui/DataTable.jsx';
import { formatMoney } from '@/lib/money';
import { usePortalPayments } from '@/features/portal/hooks/usePortalData';
import DownloadButton from '@/components/ui/DownloadButton.jsx';

export default function PortalPaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = usePortalPayments({ page, limit: 10 });

  const payments = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const columns = [
    { key: 'receiptNumber', header: 'Receipt' },
    { key: 'amount', header: 'Amount', render: (row) => formatMoney(row.amountMinorUnits) },
    { key: 'method', header: 'Method', render: (row) => row.method.replace('_', ' ') },
    { key: 'status', header: 'Status', render: (row) => (row.status === 'refunded' ? 'Refunded' : 'Completed') },
    { key: 'paidAt', header: 'Date', render: (row) => new Date(row.paidAt).toLocaleDateString() },
    {
      key: 'receipt',
      header: '',
      render: (row) => (
        <DownloadButton
          variant="link"
          label="Receipt"
          path={`/portal/payments/${row._id}/receipt`}
          filename={`Receipt-${row.receiptNumber}.pdf`}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Payment History</h1>
      <DataTable
        columns={columns}
        rows={payments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No payments yet"
        emptyDescription="Your payment history will appear here."
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}