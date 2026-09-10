import { useState } from 'react';
import { Plus, Wrench, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useBeds, useCreateBed, useUpdateBedStatus } from '../hooks/useBeds';

export default function BedList({ roomId, capacity }) {
  const { data, isLoading, isError, error } = useBeds(roomId);
  const createBed = useCreateBed(roomId);
  const updateStatus = useUpdateBedStatus(roomId);

  const [newBedNumber, setNewBedNumber] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // { bedId, nextStatus, label }

  const beds = data?.data?.beds ?? [];
  const atCapacity = beds.length >= capacity;

  const handleAddBed = async (e) => {
    e.preventDefault();
    if (!newBedNumber.trim()) return;
    await createBed.mutateAsync({ bedNumber: newBedNumber.trim() });
    setNewBedNumber('');
  };

  const confirmStatusChange = async () => {
    await updateStatus.mutateAsync({ bedId: pendingAction.bedId, status: pendingAction.nextStatus });
    setPendingAction(null);
  };

  return (
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">
          Beds ({beds.length}/{capacity})
        </h2>
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Loading beds…</p>}
      {isError && (
        <p className="text-sm text-danger">{error?.message ?? 'Failed to load beds'}</p>
      )}

      {!isLoading && !isError && beds.length === 0 && (
        <EmptyState title="No beds yet" description="Add the room's first bed below." />
      )}

      {!isLoading && !isError && beds.length > 0 && (
        <ul className="space-y-2">
          {beds.map((bed) => (
            <li
              key={bed._id}
              className="flex items-center justify-between rounded-control border border-border px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink">Bed {bed.bedNumber}</span>
                <StatusBadge status={bed.status} />
              </div>

              {bed.status === 'occupied' ? (
                <span className="text-xs text-ink-subtle">Managed via allocation</span>
              ) : (
                <div className="flex gap-1">
                  {bed.status !== 'available' && (
                    <button
                      onClick={() =>
                        setPendingAction({ bedId: bed._id, nextStatus: 'available', label: 'mark as Available' })
                      }
                      className="flex items-center gap-1 rounded-control px-2 py-1 text-xs font-medium text-success hover:bg-success-bg"
                    >
                      <CheckCircle2 size={13} /> Mark available
                    </button>
                  )}
                  {bed.status !== 'maintenance' && (
                    <button
                      onClick={() =>
                        setPendingAction({ bedId: bed._id, nextStatus: 'maintenance', label: 'mark as Maintenance' })
                      }
                      className="flex items-center gap-1 rounded-control px-2 py-1 text-xs font-medium text-warning hover:bg-warning-bg"
                    >
                      <Wrench size={13} /> Maintenance
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddBed} className="mt-4 flex gap-2">
        <input
          value={newBedNumber}
          onChange={(e) => setNewBedNumber(e.target.value)}
          disabled={atCapacity}
          placeholder={atCapacity ? 'Room is at full bed capacity' : 'New bed number (e.g. A)'}
          className="w-full max-w-xs rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-canvas"
        />
        <button
          type="submit"
          disabled={atCapacity || createBed.isPending}
          className="flex shrink-0 items-center gap-1.5 rounded-control bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={15} /> Add bed
        </button>
      </form>
      {createBed.isError && (
        <p className="mt-2 text-sm text-danger">{createBed.error.message}</p>
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmStatusChange}
        title="Change bed status"
        description={pendingAction ? `Are you sure you want to ${pendingAction.label}?` : ''}
        confirmLabel="Confirm"
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}