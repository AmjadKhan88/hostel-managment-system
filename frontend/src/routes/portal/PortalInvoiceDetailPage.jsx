import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { formatMoney } from '@/lib/money';
import { usePortalInvoice, usePaymentSubmissions } from '@/features/portal/hooks/usePortalData';
import { useState } from 'react';
import PayInvoiceModal from '@/features/portal/components/PayInvoiceModal.jsx';

export default function PortalInvoiceDetailPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePortalInvoice(invoiceId);
  const invoice = data?.data?.invoice;

  const [payModalOpen, setPayModalOpen] = useState(false);
  const { data: submissionsData } = usePaymentSubmissions(invoiceId);
  const submissions = submissionsData?.data?.items ?? [];
  const hasPending = submissions.some((s) => s.status === 'pending');

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
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          {balance > 0 && invoice.status !== 'void' && (
            <button
              onClick={() => setPayModalOpen(true)}
              disabled={hasPending}
              className="flex items-center gap-1.5 rounded-control bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard size={14} /> {hasPending ? 'Submission pending review' : 'Pay'}
            </button>
          )}
        </div>
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

      {submissions.length > 0 && (
        <div className="surface-card mt-4 p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Payment Submissions</h2>
          <ul className="space-y-2">
            {submissions.map((s) => (
              <li key={s._id} className="rounded-control border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{formatMoney(s.amountMinorUnits)}</span>
                  <span
                    className={
                      s.status === 'approved'
                        ? 'text-success'
                        : s.status === 'rejected'
                          ? 'text-danger'
                          : 'text-ink-subtle'
                    }
                  >
                    {s.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-subtle">{new Date(s.createdAt).toLocaleString()}</p>
                {s.status === 'rejected' && <p className="mt-1 text-xs text-danger">Reason: {s.rejectionReason}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <PayInvoiceModal open={payModalOpen} onClose={() => setPayModalOpen(false)} invoice={invoice} />
    </div>
  );
}