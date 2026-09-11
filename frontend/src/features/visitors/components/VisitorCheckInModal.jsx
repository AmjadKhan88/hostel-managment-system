import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal.jsx';
import { useResidents } from '@/features/residents/hooks/useResidents';
import { useCheckInVisitor } from '../hooks/useVisitors';

const schema = z.object({
  visitorName: z.string().min(2, "Visitor's name is required"),
  phone: z.string().min(6, 'Phone number is required'),
  purpose: z.string().optional(),
});

export default function VisitorCheckInModal({ open, onClose, hostelId }) {
  const checkIn = useCheckInVisitor();
  const [residentSearch, setResidentSearch] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);

  const { data: residentsData } = useResidents({
    hostelId,
    limit: 5,
    search: residentSearch || undefined,
  });
  const residents = residentSearch ? residentsData?.data?.items ?? [] : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    if (!selectedResident) return;
    await checkIn.mutateAsync({ ...values, hostelId, residentId: selectedResident._id });
    reset();
    setSelectedResident(null);
    setResidentSearch('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Check In Visitor">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Visiting resident</label>
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
          {!selectedResident && (
            <p className="mt-1 text-xs text-ink-subtle">Search and select who this visitor is here to see.</p>
          )}
        </div>

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

        {checkIn.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {checkIn.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedResident || checkIn.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkIn.isPending ? 'Checking in…' : 'Check in visitor'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';