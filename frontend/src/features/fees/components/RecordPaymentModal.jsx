import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { formatMoney, toMinorUnits } from '@/lib/money';
import { useRecordPayment } from '../hooks/usePayments';

const METHODS = ['cash', 'bank_transfer', 'card', 'mobile_wallet', 'other'];

export default function RecordPaymentModal({ open, onClose, invoice }) {
  const recordPayment = useRecordPayment(invoice?._id);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const balance = invoice ? invoice.totalMinorUnits - invoice.paidMinorUnits : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const minorUnits = toMinorUnits(amount);
    if (minorUnits <= 0 || minorUnits > balance) return;
    await recordPayment.mutateAsync({ invoiceId: invoice._id, amountMinorUnits: minorUnits, method, notes });
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-muted">
          Outstanding balance: <span className="font-medium text-ink">{formatMoney(balance)}</span>
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Amount</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setAmount((balance / 100).toFixed(2))}
            className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Pay full balance
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
        </div>

        {recordPayment.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {recordPayment.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={recordPayment.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {recordPayment.isPending ? 'Recording…' : 'Record payment'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';