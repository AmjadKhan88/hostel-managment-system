import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal.jsx';
import { useResidents } from '@/features/residents/hooks/useResidents';
import { toMinorUnits } from '@/lib/money';
import { useCreateInvoice } from '../hooks/useInvoices';

const itemSchema = z.object({
  description: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
});

const schema = z.object({
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(itemSchema).min(1),
});

export default function InvoiceFormModal({ open, onClose, hostelId }) {
  const createInvoice = useCreateInvoice();
  const [residentSearch, setResidentSearch] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);

  const { data: residentsData } = useResidents({ hostelId, limit: 5, search: residentSearch || undefined });
  const residents = residentSearch ? residentsData?.data?.items ?? [] : [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ description: '', amount: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async (values) => {
    if (!selectedResident) return;
    await createInvoice.mutateAsync({
      hostelId,
      residentId: selectedResident._id,
      dueDate: values.dueDate,
      items: values.items.map((i) => ({ description: i.description, amountMinorUnits: toMinorUnits(i.amount) })),
    });
    reset({ items: [{ description: '', amount: '' }] });
    setSelectedResident(null);
    setResidentSearch('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Invoice" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Resident</label>
          {selectedResident ? (
            <div className="flex items-center justify-between rounded-control border border-border px-3 py-2 text-sm">
              <span>{selectedResident.name}</span>
              <button
                type="button"
                onClick={() => setSelectedResident(null)}
                className="text-xs font-medium text-danger hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <input
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
                placeholder="Search resident by name…"
                className={inputClass}
              />
              {residents.length > 0 && (
                <ul className="mt-1 max-h-32 overflow-y-auto rounded-control border border-border">
                  {residents.map((r) => (
                    <li key={r._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResident(r);
                          setResidentSearch('');
                        }}
                        className="block w-full px-3 py-1.5 text-left text-sm hover:bg-canvas"
                      >
                        {r.name} <span className="text-xs text-ink-subtle">({r.registrationNumber})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Due date</label>
          <input type="date" {...register('dueDate')} className={inputClass} />
          {errors.dueDate && <p className="mt-1 text-xs text-danger">{errors.dueDate.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Line items</label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`items.${index}.description`)}
                  placeholder="Description"
                  className={`${inputClass} flex-1`}
                />
                <input
                  {...register(`items.${index}.amount`)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  className={`${inputClass} w-28`}
                />
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  className="shrink-0 rounded-control p-2 text-danger hover:bg-danger-bg"
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append({ description: '', amount: '' })}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus size={13} /> Add line item
          </button>
        </div>

        {createInvoice.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {createInvoice.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedResident || createInvoice.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createInvoice.isPending ? 'Creating…' : 'Create invoice'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';