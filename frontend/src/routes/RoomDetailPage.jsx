import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { useRoom } from '@/features/rooms/hooks/useRoom';
import { useBuildings } from '@/features/rooms/hooks/useBuildings';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import BedList from '@/features/rooms/components/BedList.jsx';

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const { data, isLoading, isError, error } = useRoom(roomId);
  const { data: buildingsData } = useBuildings(effectiveHostelId);

  const room = data?.data?.room;
  const buildings = buildingsData?.data?.buildings ?? [];
  const building = buildings.find((b) => b._id === room?.buildingId);
  const floor = building?.floors.find((f) => f._id === room?.floorId);

  if (isLoading) return <p className="text-sm text-ink-muted">Loading room…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load room'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/rooms')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Rooms & Beds
      </button>

      <PageHeader
        title={`Room ${room.roomNumber}`}
        description={`${building?.name ?? '—'} · ${floor?.name ?? '—'} · ${room.category}, capacity ${room.capacity}`}
        action={<StatusBadge status={room.status} />}
      />

      <BedList roomId={room._id} capacity={room.capacity} />
    </div>
  );
}