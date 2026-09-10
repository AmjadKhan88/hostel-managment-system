import { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useBuildings } from '@/features/rooms/hooks/useBuildings';
import BuildingQuickSetup from '@/features/rooms/components/BuildingQuickSetup.jsx';
import RoomFormModal from '@/features/rooms/components/RoomFormModal.jsx';

const ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'inactive'];

export default function RoomsPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [modalState, setModalState] = useState({ open: false, room: null });

  const { data: buildingsData } = useBuildings(effectiveHostelId);
  const buildings = buildingsData?.data?.buildings ?? [];

  const { data, isLoading, isError, error } = useRooms({
    hostelId: effectiveHostelId,
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    buildingId: buildingId || undefined,
  });

  const rooms = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before managing rooms."
      />
    );
  }

  const columns = [
    { key: 'roomNumber', header: 'Room' },
    {
      key: 'building',
      header: 'Building',
      render: (row) => buildings.find((b) => b._id === row.buildingId)?.name ?? '—',
    },
    { key: 'category', header: 'Category', render: (row) => row.category },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={() => setModalState({ open: true, room: row })}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Rooms & Beds"
        description="Manage room inventory across buildings and floors."
        action={
          <button
            onClick={() => setModalState({ open: true, room: null })}
            disabled={buildings.length === 0}
            title={buildings.length === 0 ? 'Add a building first' : undefined}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> Add Room
          </button>
        }
      />

      <BuildingQuickSetup hostelId={effectiveHostelId} />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search room number…"
          className="w-full max-w-xs rounded-control border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-brand-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All statuses</option>
          {ROOM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={buildingId}
          onChange={(e) => {
            setPage(1);
            setBuildingId(e.target.value);
          }}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All buildings</option>
          {buildings.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rooms}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No rooms yet"
        emptyDescription="Add a building and floor above, then create your first room."
        pagination={pagination}
        onPageChange={setPage}
      />

      <RoomFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, room: null })}
        hostelId={effectiveHostelId}
        room={modalState.room}
      />
    </div>
  );
}