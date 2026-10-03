import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { formatMoney } from '@/lib/money';
import { usePortalInvoice } from '@/features/portal/hooks/usePortalData';

export default function PortalInvoiceDetailPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePortalInvoice(invoiceId);
  const invoice = data?.data?.invoice;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading invoice…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load invoice'}
      </div>
    );
  }

  const balance = invoice.totalMinorUnits - invoice.paidMinorUnits;

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate('/portal/invoices')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Invoices
      </button>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">{invoice.invoiceNumber}</h1>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="surface-card p-6">
        <h2 className="text-sm font-semibold text-ink">Line items</h2>
        <ul className="mt-3 divide-y divide-border">
          {invoice.items.map((item) => (
            <li key={item._id} className="flex justify-between py-2 text-sm">
              <span className="text-ink-muted">{item.description}</span>
              <span className="font-medium text-ink">{formatMoney(item.amountMinorUnits)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">Total</span>
            <span className="font-medium text-ink">{formatMoney(invoice.totalMinorUnits)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Paid</span>
            <span className="font-medium text-success">{formatMoney(invoice.paidMinorUnits)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Balance</span>
            <span className="font-semibold text-ink">{formatMoney(balance)}</span>
          </div>
          <div className="flex justify-between pt-1 text-xs text-ink-subtle">
            <span>Due date</span>
            <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}