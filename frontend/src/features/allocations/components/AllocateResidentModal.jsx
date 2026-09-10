import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { useResidents } from '@/features/residents/hooks/useResidents';
import { useAllocateBed } from '../hooks/useAllocationMutations';

export default function AllocateResidentModal({ open, onClose, hostelId, bedId, bedNumber }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const allocate = useAllocateBed();

  const { data, isLoading } = useResidents({
    hostelId,
    limit: 10,
    search: search || undefined,
    unallocated: true,
  });
  const residents = data?.data?.items ?? [];

  const handleSubmit = async () => {
    if (!selectedId) return;
    await allocate.mutateAsync({ residentId: selectedId, bedId });
    setSelectedId(null);
    setSearch('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Assign resident to Bed ${bedNumber}`}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search residents without a bed…"
        className="mb-3 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
      />

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!isLoading && residents.length === 0 && (
        <p className="text-sm text-ink-muted">No unallocated residents found.</p>
      )}

      <ul className="max-h-60 space-y-1 overflow-y-auto">
        {residents.map((r) => (
          <li key={r._id}>
            <button
              onClick={() => setSelectedId(r._id)}
              className={`flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm ${
                selectedId === r._id ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-canvas'
              }`}
            >
              <span>{r.name}</span>
              <span className="text-xs text-ink-subtle">{r.registrationNumber}</span>
            </button>
          </li>
        ))}
      </ul>

      {allocate.isError && <p className="mt-2 text-sm text-danger">{allocate.error.message}</p>}

      <button
        onClick={handleSubmit}
        disabled={!selectedId || allocate.isPending}
        className="mt-4 w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {allocate.isPending ? 'Assigning…' : 'Assign resident'}
      </button>
    </Modal>
  );
}