import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usePortalProfile, useUpdatePortalProfile } from '@/features/portal/hooks/usePortalData';
import PortalDocumentsSection from '@/features/portal/components/PortalDocumentsSection.jsx';
const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';

export default function PortalProfilePage() {
  const { data, isLoading } = usePortalProfile();
  const updateProfile = useUpdatePortalProfile();
  const resident = data?.data?.resident;

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (resident) {
      reset({
        phone: resident.phone,
        guardianName: resident.guardian?.name ?? '',
        guardianRelationship: resident.guardian?.relationship ?? '',
        guardianPhone: resident.guardian?.phone ?? '',
        guardianEmail: resident.guardian?.email ?? '',
      });
    }
  }, [resident, reset]);

  const onSubmit = async (values) => {
    await updateProfile.mutateAsync({
      phone: values.phone,
      guardian: {
        name: values.guardianName,
        relationship: values.guardianRelationship || undefined,
        phone: values.guardianPhone,
        email: values.guardianEmail || undefined,
      },
    });
  };

  if (isLoading || !resident) return <p className="text-sm text-ink-muted">Loading profile…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-ink">My Profile</h1>

      <section className="surface-card p-6">
        <h2 className="text-sm font-semibold text-ink">Account information</h2>
        <p className="mt-2 text-xs text-ink-subtle">
          Name, email, and registration number are managed by hostel staff — contact them to update these.
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Name</dt>
            <dd className="font-medium text-ink">{resident.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Email</dt>
            <dd className="font-medium text-ink">{resident.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Registration No.</dt>
            <dd className="font-medium text-ink">{resident.registrationNumber}</dd>
          </div>
        </dl>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <section className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Contact</h2>
          <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
          <input {...register('phone')} className={inputClass} />
        </section>

        <section className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Guardian / Emergency contact</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
              <input {...register('guardianName')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Relationship</label>
              <input {...register('guardianRelationship')} className={inputClass} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
              <input {...register('guardianPhone')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email (optional)</label>
              <input type="email" {...register('guardianEmail')} className={inputClass} />
            </div>
          </div>
        </section>

        {updateProfile.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {updateProfile.error.message}
          </div>
        )}
        {updateProfile.isSuccess && (
          <div className="rounded-control bg-success-bg px-3.5 py-2.5 text-sm text-success">Profile updated.</div>
        )}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="mt-4">
        <PortalDocumentsSection />
      </div>
    </div>
  );
}