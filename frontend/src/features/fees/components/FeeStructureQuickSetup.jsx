import { useState } from 'react';
import { Plus } from 'lucide-react';
import { formatMoney, toMinorUnits } from '@/lib/money';
import { useFeeStructures, useCreateFeeStructure } from '../hooks/useFeeStructures';

const FEE_TYPES = ['rent', 'security_deposit', 'mess', 'utilities', 'other'];

export default function FeeStructureQuickSetup({ hostelId }) {
  const { data } = useFeeStructures(hostelId);
  const createFee = useCreateFeeStructure();
  const feeStructures = data?.data?.feeStructures ?? [];

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', feeType: 'rent', roomCategory: '', amount: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) return;
    await createFee.mutateAsync({
      hostelId,
      name: form.name.trim(),
      feeType: form.feeType,
      roomCategory: form.roomCategory || undefined,
      amountMinorUnits: toMinorUnits(form.amount),
    });
    setForm({ name: '', feeType: 'rent', roomCategory: '', amount: '' });
    setCreating(false);
  };

  return (
    <div className="surface-card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Fee Structures</h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus size={14} /> Add fee structure
          </button>
        )}
      </div>

      {feeStructures.length === 0 && !creating && (
        <p className="text-sm text-ink-muted">No fee structures yet — add one to start issuing invoices.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {feeStructures.map((f) => (
          <span
            key={f._id}
            className="rounded-control border border-border px-3 py-1.5 text-sm text-ink"
            title={f.roomCategory ? `Applies to ${f.roomCategory} rooms` : 'Applies to all room categories'}
          >
            {f.name} — {formatMoney(f.amountMinorUnits)}
            <span className="ml-1 text-xs text-ink-subtle">/{f.billingCycle === 'monthly' ? 'mo' : 'once'}</span>
          </span>
        ))}
      </div>

      {creating && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 grid grid-cols-2 gap-2 rounded-control border border-border p-3 sm:grid-cols-4"
        >
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Name"
            className="col-span-2 rounded-control border border-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 sm:col-span-1"
          />
          <select
            value={form.feeType}
            onChange={(e) => setForm((s) => ({ ...s, feeType: e.target.value }))}
            className="rounded-control border border-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
          >
            {FEE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
          <input
            value={form.roomCategory}
            onChange={(e) => setForm((s) => ({ ...s, roomCategory: e.target.value }))}
            placeholder="Category (optional)"
            className="rounded-control border border-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
            placeholder="Amount"
            className="rounded-control border border-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
          />
          <div className="col-span-2 flex gap-2 sm:col-span-4">
            <button
              type="submit"
              disabled={createFee.isPending}
              className="rounded-control bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-control border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
            >
              Cancel
            </button>
          </div>
          {createFee.isError && (
            <p className="col-span-2 text-xs text-danger sm:col-span-4">{createFee.error.message}</p>
          )}
        </form>
      )}
    </div>
  );
}