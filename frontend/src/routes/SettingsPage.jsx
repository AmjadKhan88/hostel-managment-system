import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import {
  useHostelSettings,
  useUpdateHostelSettings,
  useUploadHostelLogo,
} from '@/features/settings/hooks/useHostelSettings';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  timezone: z.string().min(1),
  currency: z.string().length(3, 'Use a 3-letter currency code (e.g. PKR, USD)'),
  invoicePrefix: z.string().min(1).max(10),
  defaultDueDays: z.coerce.number().int().min(0).max(90),
  line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

function toFormValues(hostel) {
  if (!hostel) return {};
  return {
    name: hostel.name,
    timezone: hostel.timezone,
    currency: hostel.currency,
    invoicePrefix: hostel.invoicePrefix,
    defaultDueDays: hostel.defaultDueDays,
    line1: hostel.address?.line1 ?? '',
    city: hostel.address?.city ?? '',
    state: hostel.address?.state ?? '',
    country: hostel.address?.country ?? '',
    postalCode: hostel.address?.postalCode ?? '',
  };
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const { data, isLoading } = useHostelSettings(effectiveHostelId);
  const updateSettings = useUpdateHostelSettings(effectiveHostelId);
  const uploadLogo = useUploadHostelLogo(effectiveHostelId);
  const fileInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);

  const hostel = data?.data?.hostel;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (hostel) reset(toFormValues(hostel));
  }, [hostel, reset]);

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before editing its settings."
      />
    );
  }

  const onSubmit = async (values) => {
    await updateSettings.mutateAsync({
      name: values.name,
      timezone: values.timezone,
      currency: values.currency.toUpperCase(),
      invoicePrefix: values.invoicePrefix,
      defaultDueDays: values.defaultDueDays,
      address: {
        line1: values.line1,
        city: values.city,
        state: values.state,
        country: values.country,
        postalCode: values.postalCode,
      },
    });
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append('file', logoFile);

    try {
      await uploadLogo.mutateAsync(formData);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.log(error)
    }
  };

  if (isLoading) return <p className="text-sm text-ink-muted">Loading settings…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Hostel information, branding, currency, and invoice defaults." />

      <section className="surface-card p-6">
        <h2 className="text-sm font-semibold text-ink">Branding</h2>
        <div className="mt-3 flex items-center gap-4">
          {hostel?.logoUrl ? (
            <img
              src={hostel.logoUrl}
              alt="Hostel logo"
              className="h-16 w-16 rounded-control border border-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-control border border-dashed border-border text-xs text-ink-subtle">
              No logo
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ink-muted file:mr-2 file:rounded-control file:border-0 file:bg-canvas file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-border"
            />
            <button
              onClick={handleLogoUpload}
              disabled={!logoFile || uploadLogo.isPending}
              className="mt-2 flex items-center gap-1.5 rounded-control bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={13} /> {uploadLogo.isPending ? 'Uploading…' : 'Upload logo'}
            </button>
            {uploadLogo.isError && (
              <p className="mt-2 text-sm text-danger">{uploadLogo.error.message}</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-subtle">JPEG or PNG.</p>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <section className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Hostel information</h2>
          <div className="space-y-3">
            <Field label="Name" error={errors.name}>
              <input {...register('name')} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Timezone" error={errors.timezone}>
                <input {...register('timezone')} placeholder="e.g. Asia/Karachi" className={inputClass} />
              </Field>
              <Field label="Currency" error={errors.currency}>
                <input
                  {...register('currency')}
                  placeholder="e.g. PKR"
                  maxLength={3}
                  className={`${inputClass} uppercase`}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Address</h2>
          <div className="grid grid-cols-2 gap-3">
            <input {...register('line1')} placeholder="Address line 1" className={`${inputClass} col-span-2`} />
            <input {...register('city')} placeholder="City" className={inputClass} />
            <input {...register('state')} placeholder="State/Province" className={inputClass} />
            <input {...register('country')} placeholder="Country" className={inputClass} />
            <input {...register('postalCode')} placeholder="Postal code" className={inputClass} />
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Invoice defaults</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice number prefix" error={errors.invoicePrefix}>
              <input {...register('invoicePrefix')} className={inputClass} />
            </Field>
            <Field label="Default due days" error={errors.defaultDueDays}>
              <input type="number" min={0} max={90} {...register('defaultDueDays')} className={inputClass} />
            </Field>
          </div>
          <p className="mt-2 text-xs text-ink-subtle">
            New invoices use this prefix (e.g. &quot;{hostel?.invoicePrefix ?? 'INV'}-2026-000001&quot;) and, if you don&apos;t set
            a due date manually, fall due this many days after issuing.
          </p>
        </section>

        {updateSettings.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {updateSettings.error.message}
          </div>
        )}
        {updateSettings.isSuccess && (
          <div className="rounded-control bg-success-bg px-3.5 py-2.5 text-sm text-success">Settings saved.</div>
        )}

        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {updateSettings.isPending ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
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