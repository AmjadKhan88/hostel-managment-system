import { useState } from 'react';
import { ArrowRightLeft, LogOut } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useRoom } from '@/features/rooms/hooks/useRoom';
import { useBeds } from '@/features/rooms/hooks/useBeds';
import { useCheckoutResident } from '../hooks/useAllocationMutations';
import BedPickerModal from './BedPickerModal.jsx';

export default function CurrentAllocationCard({ resident, hostelId, activeAllocation }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const checkout = useCheckoutResident(resident._id);

  const roomId = activeAllocation?.roomId;
  const bedId = activeAllocation?.bedId;

  const { data: roomData } = useRoom(roomId);
  const { data: bedsData } = useBeds(roomId);

  const room = roomData?.data?.room;
  const bed = (bedsData?.data?.beds ?? []).find((b) => b._id === bedId);

  const handleCheckout = async () => {
    await checkout.mutateAsync();
    setConfirmCheckout(false);
  };

  return (
    <section className="surface-card p-6">
      <h2 className="text-sm font-semibold text-ink">Current allocation</h2>

      {!activeAllocation && (
        <>
          <p className="mt-2 text-sm text-ink-muted">This resident isn&apos;t assigned to a bed yet.</p>
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-3 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Assign a bed
          </button>
        </>
      )}

      {activeAllocation && (
        <>
          <p className="mt-2 text-sm text-ink-muted">
            Room <span className="font-medium text-ink">{room?.roomNumber ?? '…'}</span>, Bed{' '}
            <span className="font-medium text-ink">{bed?.bedNumber ?? '…'}</span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
            >
              <ArrowRightLeft size={14} /> Transfer
            </button>
            <button
              onClick={() => setConfirmCheckout(true)}
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-bg"
            >
              <LogOut size={14} /> Checkout
            </button>
          </div>
        </>
      )}

      <BedPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        hostelId={hostelId}
        residentId={resident._id}
        mode={activeAllocation ? 'transfer' : 'allocate'}
      />

      <ConfirmDialog
        open={confirmCheckout}
        onClose={() => setConfirmCheckout(false)}
        onConfirm={handleCheckout}
        title="Check out resident"
        description="This will free up their current bed and mark the resident as checked out. This can't be undone from here."
        confirmLabel="Check out"
        danger
        isLoading={checkout.isPending}
      />
    </section>
  );
}