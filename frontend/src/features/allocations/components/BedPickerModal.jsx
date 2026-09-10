import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { useBuildings } from '@/features/rooms/hooks/useBuildings';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useBeds } from '@/features/rooms/hooks/useBeds';
import { useAllocateBed, useTransferResident } from '../hooks/useAllocationMutations';

export default function BedPickerModal({ open, onClose, hostelId, residentId, mode }) {
  const [buildingId, setBuildingId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');

  const { data: buildingsData } = useBuildings(hostelId);
  const buildings = buildingsData?.data?.buildings ?? [];

  const { data: roomsData } = useRooms({
    hostelId,
    buildingId: buildingId || undefined,
    status: 'available',
    limit: 100,
  });
  const rooms = roomsData?.data?.items ?? [];

  const { data: bedsData } = useBeds(roomId);
  const beds = (bedsData?.data?.beds ?? []).filter((b) => b.status === 'available');

  const allocate = useAllocateBed();
  const transfer = useTransferResident(residentId);
  const mutation = mode === 'transfer' ? transfer : allocate;

  const handleSubmit = async () => {
    if (!bedId) return;
    if (mode === 'transfer') {
      await mutation.mutateAsync({ newBedId: bedId });
    } else {
      await mutation.mutateAsync({ residentId, bedId });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'transfer' ? 'Transfer to a new bed' : 'Assign a bed'}>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Building</label>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setRoomId('');
              setBedId('');
            }}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">Select…</option>
            {buildings.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Room</label>
          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setBedId('');
            }}
            disabled={!buildingId}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500 disabled:bg-canvas"
          >
            <option value="">Select…</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber} ({r.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Bed</label>
          <select
            value={bedId}
            onChange={(e) => setBedId(e.target.value)}
            disabled={!roomId}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500 disabled:bg-canvas"
          >
            <option value="">Select…</option>
            {beds.map((b) => (
              <option key={b._id} value={b._id}>
                Bed {b.bedNumber}
              </option>
            ))}
          </select>
          {roomId && beds.length === 0 && (
            <p className="mt-1 text-xs text-ink-subtle">No available beds in this room.</p>
          )}
        </div>

        {mutation.isError && <p className="text-sm text-danger">{mutation.error.message}</p>}

        <button
          onClick={handleSubmit}
          disabled={!bedId || mutation.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : mode === 'transfer' ? 'Transfer resident' : 'Assign bed'}
        </button>
      </div>
    </Modal>
  );
}