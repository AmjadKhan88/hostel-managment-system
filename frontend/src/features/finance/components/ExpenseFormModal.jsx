import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { toMinorUnits, formatMoney } from '@/lib/money';
import { useCreateExpense, useUpdateExpense } from '../hooks/useFinance';

const CATEGORIES = ['electricity', 'water', 'internet', 'salary', 'maintenance_supplies', 'technical', 'rent', 'other'];

function toFormValues(expense) {
  if (!expense) {
    return { title: '', category: 'electricity', amount: '', recurrence: 'one_time', incurredAt: '' };
  }
  return {
    title: expense.title,
    category: expense.category,
    amount: (expense.amountMinorUnits / 100).toFixed(2),
    recurrence: expense.recurrence,
    incurredAt: expense.incurredAt ? expense.incurredAt.slice(0, 10) : '',
  };
}

export default function ExpenseFormModal({ open, onClose, hostelId, expense }) {
  const isEdit = Boolean(expense);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const mutation = isEdit ? updateExpense : createExpense;

  const [form, setForm] = useState(toFormValues(expense));

  useEffect(() => {
    if (open) setForm(toFormValues(expense));
  }, [open, expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    const payload = {
      title: form.title.trim(),
      category: form.category,
      amountMinorUnits: toMinorUnits(form.amount),
      recurrence: form.recurrence,
      incurredAt: form.incurredAt || undefined,
    };

    if (isEdit) {
      await mutation.mutateAsync({ id: expense._id, data: payload });
    } else {
      await mutation.mutateAsync({ hostelId, ...payload });
    }
    onClose();
  };

  const wasMonthly = expense?.recurrence === 'monthly';
  const isTurningOff = isEdit && wasMonthly && form.recurrence === 'one_time';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Expense' : 'Record Expense'}>
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

        <p className="text-xs text-ink-subtle">
          {form.recurrence === 'monthly'
            ? `Monthly: a new expense will be generated automatically each month, using this exact title/category/amount${form.amount ? ` (${formatMoney(toMinorUnits(form.amount))})` : ''
            } — until you edit the most recent one and set it back to One-time.`
            : 'One-time: recorded once, nothing generated automatically.'}
          {isTurningOff && ' This will stop future months from being generated for this expense.'}
        </p>

        {mutation.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Record expense'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';