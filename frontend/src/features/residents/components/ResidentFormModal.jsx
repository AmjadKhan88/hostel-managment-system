import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal.jsx';
import { useCreateResident, useUpdateResident } from '../hooks/useResidentMutations';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(6, 'Phone is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  institution: z.string().optional(),
  department: z.string().optional(),
  guardianName: z.string().min(1, "Guardian's name is required"),
  guardianRelationship: z.string().optional(),
  guardianPhone: z.string().min(6, "Guardian's phone is required"),
});

function toFormValues(resident) {
  if (!resident) return { institution: '', department: '', guardianRelationship: '' };
  return {
    name: resident.name,
    email: resident.email ?? '',
    phone: resident.phone,
    registrationNumber: resident.registrationNumber,
    institution: resident.institution ?? '',
    department: resident.department ?? '',
    guardianName: resident.guardian?.name ?? '',
    guardianRelationship: resident.guardian?.relationship ?? '',
    guardianPhone: resident.guardian?.phone ?? '',
  };
}

export default function ResidentFormModal({ open, onClose, hostelId, resident }) {
  const isEdit = Boolean(resident);
  const createResident = useCreateResident();
  const updateResident = useUpdateResident();
  const mutation = isEdit ? updateResident : createResident;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(resident) });

  useEffect(() => {
    if (open) reset(toFormValues(resident));
  }, [open, resident, reset]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone,
      institution: values.institution || undefined,
      department: values.department || undefined,
      guardian: {
        name: values.guardianName,
        relationship: values.guardianRelationship || undefined,
        phone: values.guardianPhone,
      },
    };

    if (isEdit) {
      await mutation.mutateAsync({ id: resident._id, data: payload });
    } else {
      await mutation.mutateAsync({ ...payload, hostelId, registrationNumber: values.registrationNumber });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Resident' : 'Add Resident'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" error={errors.name}>
            <input {...register('name')} className={inputClass} />
          </Field>
          <Field label="Registration number" error={errors.registrationNumber}>
            <input {...register('registrationNumber')} disabled={isEdit} className={`${inputClass} disabled:bg-canvas`} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" error={errors.phone}>
            <input {...register('phone')} className={inputClass} />
          </Field>
          <Field label="Email (optional)" error={errors.email}>
            <input type="email" {...register('email')} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Institution (optional)">
            <input {...register('institution')} className={inputClass} />
          </Field>
          <Field label="Department (optional)">
            <input {...register('department')} className={inputClass} />
          </Field>
        </div>

        <div className="rounded-control border border-border p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Guardian / Emergency contact
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" error={errors.guardianName}>
              <input {...register('guardianName')} className={inputClass} />
            </Field>
            <Field label="Relationship (optional)">
              <input {...register('guardianRelationship')} className={inputClass} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Phone" error={errors.guardianPhone}>
              <input {...register('guardianPhone')} className={inputClass} />
            </Field>
          </div>
        </div>

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
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add resident'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error.message}</p>}
    </div>
  );
}