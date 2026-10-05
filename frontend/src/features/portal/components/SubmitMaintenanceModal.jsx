import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal.jsx';
import { useSubmitMaintenanceRequest } from '../hooks/usePortalData';

const CATEGORIES = ['plumbing', 'electrical', 'carpentry', 'painting', 'appliance', 'other'];

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.enum(CATEGORIES),
});

export default function SubmitMaintenanceModal({ open, onClose }) {
  const submitRequest = useSubmitMaintenanceRequest();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    await submitRequest.mutateAsync(values);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Maintenance Request">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
          <input {...register('title')} placeholder="e.g. Leaking tap" className={inputClass} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
          <textarea rows={3} {...register('description')} className={inputClass} />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
          <select {...register('category')} className={inputClass}>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
        </div>

        <p className="text-xs text-ink-subtle">This will be logged against your current room automatically.</p>

        {submitRequest.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {submitRequest.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitRequest.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitRequest.isPending ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';