import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal.jsx';
import { usePreRegisterVisitor } from '../hooks/usePortalData';

const schema = z.object({
  visitorName: z.string().min(2, "Visitor's name is required"),
  phone: z.string().min(6, 'Phone is required'),
  purpose: z.string().optional(),
  expectedAt: z.string().optional(),
});

export default function PreRegisterVisitorModal({ open, onClose }) {
  const preRegister = usePreRegisterVisitor();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    await preRegister.mutateAsync({ ...values, expectedAt: values.expectedAt || undefined });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Pre-Register a Visitor">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Visitor name</label>
          <input {...register('visitorName')} className={inputClass} />
          {errors.visitorName && <p className="mt-1 text-xs text-danger">{errors.visitorName.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
          <input {...register('phone')} className={inputClass} />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Purpose (optional)</label>
          <input {...register('purpose')} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Expected arrival (optional)</label>
          <input type="datetime-local" {...register('expectedAt')} className={inputClass} />
        </div>

        {preRegister.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {preRegister.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={preRegister.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {preRegister.isPending ? 'Saving…' : 'Pre-register visitor'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';