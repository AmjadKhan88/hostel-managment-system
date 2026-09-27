import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { toMinorUnits } from '@/lib/money';
import { useCreateExpense } from '../hooks/useFinance';

const CATEGORIES = ['electricity', 'water', 'internet', 'salary', 'maintenance_supplies', 'technical', 'rent', 'other'];

export default function ExpenseFormModal({ open, onClose, hostelId }) {
  const createExpense = useCreateExpense();
  const [form, setForm] = useState({
    title: '',
    category: 'electricity',
    amount: '',
    recurrence: 'one_time',
    incurredAt: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    await createExpense.mutateAsync({
      hostelId,
      title: form.title.trim(),
      category: form.category,
      amountMinorUnits: toMinorUnits(form.amount),
      recurrence: form.recurrence,
      incurredAt: form.incurredAt || undefined,
    });
    setForm({ title: '', category: 'electricity', amount: '', recurrence: 'one_time', incurredAt: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            placeholder="e.g. September electricity bill"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Recurrence</label>
            <select
              value={form.recurrence}
              onChange={(e) => setForm((s) => ({ ...s, recurrence: e.target.value }))}
              className={inputClass}
            >
              <option value="one_time">One-time</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Date (optional)</label>
            <input
              type="date"
              value={form.incurredAt}
              onChange={(e) => setForm((s) => ({ ...s, incurredAt: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        {createExpense.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {createExpense.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={createExpense.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {createExpense.isPending ? 'Saving…' : 'Record expense'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';