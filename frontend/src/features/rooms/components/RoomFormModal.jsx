import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { useBuildings } from '../hooks/useBuildings';
import { useCreateRoom, useUpdateRoom } from '../hooks/useRoomMutations';

const ROOM_CATEGORIES = ['single', 'double', 'triple', 'dormitory', 'suite'];

const schema = z.object({
  buildingId: z.string().min(1, 'Select a building'),
  floorId: z.string().min(1, 'Select a floor'),
  roomNumber: z.string().min(1, 'Room number is required'),
  category: z.enum(ROOM_CATEGORIES),
  capacity: z.coerce.number().int().min(1).max(20),
});

export default function RoomFormModal({ open, onClose, hostelId, room }) {
  const isEdit = Boolean(room);
  const { data } = useBuildings(hostelId);
  const buildings = data?.data?.buildings ?? [];
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: room
      ? {
          buildingId: room.buildingId,
          floorId: room.floorId,
          roomNumber: room.roomNumber,
          category: room.category,
          capacity: room.capacity,
        }
      : { category: 'single', capacity: 1 },
  });

  useEffect(() => {
    if (open) {
      reset(
        room
          ? {
              buildingId: room.buildingId,
              floorId: room.floorId,
              roomNumber: room.roomNumber,
              category: room.category,
              capacity: room.capacity,
            }
          : { category: 'single', capacity: 1 }
      );
    }
  }, [open, room, reset]);

  const selectedBuildingId = watch('buildingId');
  const selectedBuilding = buildings.find((b) => b._id === selectedBuildingId);
  const mutation = isEdit ? updateRoom : createRoom;

  const onSubmit = async (values) => {
    if (isEdit) {
      await mutation.mutateAsync({ id: room._id, data: { category: values.category, capacity: values.capacity } });
    } else {
      await mutation.mutateAsync({ ...values, hostelId });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Room' : 'Add Room'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Building</label>
            <select
              {...register('buildingId')}
              disabled={isEdit}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 disabled:bg-canvas"
            >
              <option value="">Select…</option>
              {buildings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.buildingId && <p className="mt-1 text-xs text-danger">{errors.buildingId.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Floor</label>
            <select
              {...register('floorId')}
              disabled={isEdit || !selectedBuilding}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 disabled:bg-canvas"
            >
              <option value="">Select…</option>
              {selectedBuilding?.floors.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
            {errors.floorId && <p className="mt-1 text-xs text-danger">{errors.floorId.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Room number</label>
          <input
            {...register('roomNumber')}
            disabled={isEdit}
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500 disabled:bg-canvas"
          />
          {errors.roomNumber && <p className="mt-1 text-xs text-danger">{errors.roomNumber.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <select
              {...register('category')}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500"
            >
              {ROOM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Capacity</label>
            <input
              type="number"
              min={1}
              max={20}
              {...register('capacity')}
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
            />
            {errors.capacity && <p className="mt-1 text-xs text-danger">{errors.capacity.message}</p>}
          </div>
        </div>

        {mutation.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create room'}
        </button>
      </form>
    </Modal>
  );
}