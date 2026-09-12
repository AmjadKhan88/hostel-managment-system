import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { formatMoney } from '@/lib/money';
import { useInvoice, useVoidInvoice } from '@/features/fees/hooks/useInvoices';
import { usePaymentsForInvoice, useRefundPayment } from '@/features/fees/hooks/usePayments';
import RecordPaymentModal from '@/features/fees/components/RecordPaymentModal.jsx';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useInvoice(invoiceId);
  const { data: paymentsData } = usePaymentsForInvoice(invoiceId);
  const voidInvoice = useVoidInvoice(invoiceId);
  const refundPayment = useRefundPayment(invoiceId);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [refundingId, setRefundingId] = useState(null);

  const invoice = data?.data?.invoice;
  const payments = paymentsData?.data?.items ?? [];

  if (isLoading) return <p className="text-sm text-ink-muted">Loading invoice…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load invoice'}
      </div>
    );
  }

  const balance = invoice.totalMinorUnits - invoice.paidMinorUnits;
  const canRecordPayment = invoice.status !== 'void' && balance > 0;
  const canVoid = invoice.status === 'issued' && invoice.paidMinorUnits === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/fees')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Fees &amp; Payments
      </button>

      <PageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.residentId?.name ?? '—'} · Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
        action={<StatusBadge status={invoice.status} />}
      />

      <section className="surface-card p-6">
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
        </div>

        <div className="mt-4 flex gap-2">
          {canRecordPayment && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Record Payment
            </button>
          )}
          {canVoid && (
            <button
              onClick={() => setConfirmVoid(true)}
              className="rounded-control border border-border px-4 py-2 text-sm font-medium text-danger hover:bg-danger-bg"
            >
              Void Invoice
            </button>
          )}
        </div>
      </section>

      <section className="surface-card mt-4 p-6">
        <h2 className="text-sm font-semibold text-ink">Payment history</h2>
        {payments.length === 0 && <p className="mt-2 text-sm text-ink-muted">No payments recorded yet.</p>}
        <ul className="mt-3 space-y-2">
          {payments.map((p) => (
            <li
              key={p._id}
              className="flex items-center justify-between rounded-control border border-border px-3.5 py-2.5 text-sm"
            >
              <div>
                <p className="font-medium text-ink">
                  {formatMoney(p.amountMinorUnits)}{' '}
                  <span className="text-xs text-ink-subtle">via {p.method.replace('_', ' ')}</span>
                </p>
                <p className="text-xs text-ink-subtle">
                  {p.receiptNumber} · {new Date(p.paidAt).toLocaleString()}
                </p>
              </div>
              {p.status === 'refunded' ? (
                <span className="text-xs font-medium text-ink-subtle">Refunded</span>
              ) : (
                <button
                  onClick={() => setRefundingId(p._id)}
                  className="text-xs font-medium text-danger hover:underline"
                >
                  Refund
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <RecordPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} invoice={invoice} />

      <ConfirmDialog
        open={confirmVoid}
        onClose={() => setConfirmVoid(false)}
        onConfirm={() => voidInvoice.mutate(undefined, { onSuccess: () => setConfirmVoid(false) })}
        title="Void invoice"
        description="This marks the invoice as void. It can only be done before any payment is recorded."
        confirmLabel="Void invoice"
        danger
        isLoading={voidInvoice.isPending}
      />

      <ConfirmDialog
        open={Boolean(refundingId)}
        onClose={() => setRefundingId(null)}
        onConfirm={() =>
          refundPayment.mutate({ id: refundingId, reason: '' }, { onSuccess: () => setRefundingId(null) })
        }
        title="Refund payment"
        description="This reverses the payment and reduces the amount paid on this invoice."
        confirmLabel="Refund"
        danger
        isLoading={refundPayment.isPending}
      />
    </div>
  );
}