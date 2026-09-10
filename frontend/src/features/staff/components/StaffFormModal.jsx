import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal.jsx';
import { useRoles } from '../hooks/useRoles';
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaff';

const createSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Temporary password must be at least 8 characters'),
  roleId: z.string().min(1, 'Select a role'),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  roleId: z.string().min(1, 'Select a role'),
  status: z.enum(['active', 'suspended']),
});

export default function StaffFormModal({ open, onClose, hostelId, staff }) {
  const isEdit = Boolean(staff);
  const { data } = useRoles(hostelId);
  const roles = data?.data?.roles ?? [];
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const mutation = isEdit ? updateStaff : createStaff;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit
      ? { name: staff?.name, roleId: staff?.roleId?._id, status: staff?.status }
      : { roleId: '' },
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? { name: staff?.name, roleId: staff?.roleId?._id, status: staff?.status }
          : { roleId: '' }
      );
    }
  }, [open, staff, isEdit, reset]);

  const onSubmit = async (values) => {
    if (isEdit) {
      await mutation.mutateAsync({ id: staff._id, data: values });
    } else {
      await mutation.mutateAsync({ ...values, hostelId });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Staff Member' : 'Add Staff Member'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
          <input {...register('name')} className={inputClass} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        {!isEdit && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input type="email" {...register('email')} className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Temporary password</label>
              <input type="password" {...register('password')} className={inputClass} />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
              <p className="mt-1 text-xs text-ink-subtle">
                Share this with the staff member directly — there&apos;s no email invite yet.
              </p>
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Role</label>
          <select {...register('roleId')} className={inputClass}>
            <option value="">Select…</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          {errors.roleId && <p className="mt-1 text-xs text-danger">{errors.roleId.message}</p>}
          {roles.length === 0 && (
            <p className="mt-1 text-xs text-ink-subtle">Add a role above before creating staff.</p>
          )}
        </div>

        {isEdit && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Status</label>
            <select {...register('status')} className={inputClass}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )}

        {mutation.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || roles.length === 0}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add staff member'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';