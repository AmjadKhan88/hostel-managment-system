import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { useResidents } from '@/features/residents/hooks/useResidents';
import { useCreateAdmission } from '../hooks/useAdmissionMutations';

export default function AdmissionFormModal({ open, onClose, hostelId }) {
  const createAdmission = useCreateAdmission();
  const [search, setSearch] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [requestedCategory, setRequestedCategory] = useState('');

  const { data } = useResidents({ hostelId, limit: 10, status: 'pending', search: search || undefined });
  const residents = data?.data?.items ?? [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResident) return;
    await createAdmission.mutateAsync({
      hostelId,
      residentId: selectedResident._id,
      requestedCategory: requestedCategory || undefined,
    });
    setSelectedResident(null);
    setSearch('');
    setRequestedCategory('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Admission">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Applicant (pending resident)</label>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pending residents by name…"
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
                          setSearch('');
                        }}
                        className="block w-full px-3 py-1.5 text-left text-sm hover:bg-canvas"
                      >
                        {r.name} <span className="text-xs text-ink-subtle">({r.registrationNumber})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {search && residents.length === 0 && (
                <p className="mt-1 text-xs text-ink-subtle">
                  No pending residents match. Create the resident profile first on the Residents page — an
                  admission wraps an existing pending resident.
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Requested category (optional)</label>
          <input
            value={requestedCategory}
            onChange={(e) => setRequestedCategory(e.target.value)}
            placeholder="e.g. double"
            className={inputClass}
          />
        </div>

        {createAdmission.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {createAdmission.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedResident || createAdmission.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createAdmission.isPending ? 'Creating…' : 'Start admission'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';