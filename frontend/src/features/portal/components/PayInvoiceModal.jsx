import { useEffect, useRef, useState } from 'react';
import { Copy, Check, Landmark, Smartphone } from 'lucide-react';
import Modal from '@/components/ui/Modal.jsx';
import { formatMoney, toMinorUnits } from '@/lib/money';
import { usePaymentMethods, useSubmitPaymentProof } from '../hooks/usePortalData';

const TYPE_LABELS = { bank_transfer: 'Bank Transfer', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa', other: 'Other' };

function CopyableField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-subtle">{label}</span>
      <button onClick={handleCopy} className="flex items-center gap-1 font-medium text-ink hover:text-brand-600">
        {value} {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

export default function PayInvoiceModal({ open, onClose, invoice }) {
  const { data: methodsData } = usePaymentMethods();
  const submitProof = useSubmitPaymentProof();
  const fileInputRef = useRef(null);

  const methods = methodsData?.data?.paymentMethods ?? [];
  const balance = invoice ? invoice.totalMinorUnits - invoice.paidMinorUnits : 0;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (open && invoice) {
      setAmount((balance / 100).toFixed(2));
      setSelectedMethod(methods[0] ?? null);
      setTransactionReference('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?._id, methods.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMethod || !file || !amount) return;

    const formData = new FormData();
    formData.append('invoiceId', invoice._id);
    formData.append('amountMinorUnits', toMinorUnits(amount));
    formData.append('method', selectedMethod.type);
    formData.append('paidToLabel', selectedMethod.label);
    if (transactionReference) formData.append('transactionReference', transactionReference);
    formData.append('screenshot', file);

    await submitProof.mutateAsync(formData);
    onClose();
  };

  if (!invoice) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Pay Invoice ${invoice.invoiceNumber}`}>
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Outstanding balance: <span className="font-semibold text-ink">{formatMoney(balance)}</span>
        </p>

        {methods.length === 0 ? (
          <div className="rounded-control bg-warning-bg px-3.5 py-2.5 text-sm text-warning">
            No payment methods have been configured yet — contact hostel staff.
          </div>
        ) : (
          <>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Pay into one of these accounts:</p>
              <div className="space-y-2">
                {methods.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => setSelectedMethod(m)}
                    className={`w-full rounded-control border p-3 text-left transition ${selectedMethod?._id === m._id ? 'border-brand-500 bg-brand-50' : 'border-border hover:bg-canvas'
                      }`}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      {m.type === 'bank_transfer' ? <Landmark size={15} /> : <Smartphone size={15} />}
                      <span className="text-sm font-medium text-ink">
                        {m.label} <span className="text-xs text-ink-subtle">({TYPE_LABELS[m.type]})</span>
                      </span>
                    </div>
                    <CopyableField label="Account name" value={m.accountName} />
                    <CopyableField label="Account number" value={m.accountNumber} />
                    {m.bankName && <CopyableField label="Bank" value={m.bankName} />}
                    {m.instructions && <p className="mt-1.5 text-xs text-ink-subtle">{m.instructions}</p>}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium text-ink">After you've paid, submit proof here:</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Amount paid</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={balance / 100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Transaction reference (optional)</label>
                <input
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. TRX ID from your banking app"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Payment screenshot</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full text-sm text-ink-muted file:mr-2 file:rounded-control file:border-0 file:bg-canvas file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-border"
                />
              </div>

              {submitProof.isError && (
                <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
                  {submitProof.error.message}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedMethod || !file || submitProof.isPending}
                className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitProof.isPending ? 'Submitting…' : 'Submit for review'}
              </button>
              <p className="text-center text-xs text-ink-subtle">
                Staff will verify this and apply it to your invoice — it won't show as paid until approved.
              </p>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';