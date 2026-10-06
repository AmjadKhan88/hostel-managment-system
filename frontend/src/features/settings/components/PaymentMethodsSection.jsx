import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Pencil, Landmark, Smartphone } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';

const TYPES = ['bank_transfer', 'jazzcash', 'easypaisa', 'other'];
const TYPE_LABELS = { bank_transfer: 'Bank Transfer', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa', other: 'Other' };

const schema = z.object({
  type: z.enum(TYPES),
  label: z.string().min(2).max(80),
  accountName: z.string().min(2),
  accountNumber: z.string().min(3),
  bankName: z.string().optional(),
  instructions: z.string().optional(),
});

function useAddPaymentMethod(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post(`/hostels/${hostelId}/payment-methods`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostel-settings', hostelId] }),
  });
}

function useUpdatePaymentMethod(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ methodId, data }) => apiClient.patch(`/hostels/${hostelId}/payment-methods/${methodId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostel-settings', hostelId] }),
  });
}

function useRemovePaymentMethod(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId) => apiClient.delete(`/hostels/${hostelId}/payment-methods/${methodId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostel-settings', hostelId] }),
  });
}

export default function PaymentMethodsSection({ hostelId, paymentMethods = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const addMethod = useAddPaymentMethod(hostelId);
  const updateMethod = useUpdatePaymentMethod(hostelId);
  const removeMethod = useRemovePaymentMethod(hostelId);

  const { register, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'bank_transfer' },
  });
  const watchedType = watch('type');

  const openAdd = () => {
    setEditing(null);
    reset({ type: 'bank_transfer', label: '', accountName: '', accountNumber: '', bankName: '', instructions: '' });
    setModalOpen(true);
  };

  const openEdit = (method) => {
    setEditing(method);
    reset(method);
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    if (editing) {
      await updateMethod.mutateAsync({ methodId: editing._id, data: values });
    } else {
      await addMethod.mutateAsync(values);
    }
    setModalOpen(false);
  };

  const toggleActive = (method) => updateMethod.mutate({ methodId: method._id, data: { isActive: !method.isActive } });

  return (
    <section className="surface-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Payment Methods</h2>
          <p className="mt-0.5 text-xs text-ink-subtle">
            Accounts shown to residents when they pay via the Resident Portal.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-control bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <p className="text-sm text-ink-muted">No payment methods configured yet — residents won't be able to pay online.</p>
      ) : (
        <ul className="space-y-2">
          {paymentMethods.map((m) => (
            <li
              key={m._id}
              className={`flex items-center justify-between rounded-control border px-3.5 py-2.5 ${m.isActive ? 'border-border' : 'border-border opacity-50'
                }`}
            >
              <div className="flex items-center gap-2.5">
                {m.type === 'bank_transfer' ? <Landmark size={16} className="text-ink-subtle" /> : <Smartphone size={16} className="text-ink-subtle" />}
                <div>
                  <p className="text-sm font-medium text-ink">
                    {m.label} <span className="text-xs text-ink-subtle">({TYPE_LABELS[m.type]})</span>
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {m.accountName} · {m.accountNumber}
                    {m.bankName && ` · ${m.bankName}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(m)}
                  className="rounded-control px-2 py-1 text-xs font-medium text-ink-muted hover:bg-canvas"
                >
                  {m.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => openEdit(m)} className="rounded-control p-1.5 text-ink-muted hover:bg-canvas">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setRemoving(m)} className="rounded-control p-1.5 text-danger hover:bg-danger-bg">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Payment Method' : 'Add Payment Method'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Type</label>
            <select {...register('type')} className={inputClass}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Label</label>
            <input {...register('label')} placeholder="e.g. HBL - Main Account" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Account name</label>
              <input {...register('accountName')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Account / IBAN / number</label>
              <input {...register('accountNumber')} className={inputClass} />
            </div>
          </div>
          {watchedType === 'bank_transfer' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Bank name</label>
              <input {...register('bankName')} className={inputClass} />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Instructions (optional)</label>
            <textarea rows={2} {...register('instructions')} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={addMethod.isPending || updateMethod.isPending}
            className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {editing ? 'Save changes' : 'Add payment method'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          await removeMethod.mutateAsync(removing._id);
          setRemoving(null);
        }}
        title="Remove payment method"
        description={removing ? `Remove "${removing.label}"? Residents will no longer see this option.` : ''}
        confirmLabel="Remove"
        danger
        isLoading={removeMethod.isPending}
      />
    </section>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';