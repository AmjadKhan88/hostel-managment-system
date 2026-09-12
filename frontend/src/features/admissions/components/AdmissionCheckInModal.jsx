import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { useBuildings } from '@/features/rooms/hooks/useBuildings';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useBeds } from '@/features/rooms/hooks/useBeds';
import { useCheckInAdmission } from '../hooks/useAdmissionMutations';

export default function AdmissionCheckInModal({ open, onClose, hostelId, admissionId }) {
  const [buildingId, setBuildingId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [deposit, setDeposit] = useState('');
  const [initialPayment, setInitialPayment] = useState('');

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

  const checkIn = useCheckInAdmission(admissionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bedId) return;
    await checkIn.mutateAsync({
      bedId,
      securityDepositMinorUnits: Math.round(Number(deposit || 0) * 100),
      initialPaymentMinorUnits: Math.round(Number(initialPayment || 0) * 100),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Check In Resident">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Building</label>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setRoomId('');
              setBedId('');
            }}
            className={inputClass}
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
            className={`${inputClass} disabled:bg-canvas`}
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
            className={`${inputClass} disabled:bg-canvas`}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Security deposit</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Initial payment</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={initialPayment}
              onChange={(e) => setInitialPayment(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {checkIn.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {checkIn.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!bedId || checkIn.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkIn.isPending ? 'Checking in…' : 'Check in resident'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500';