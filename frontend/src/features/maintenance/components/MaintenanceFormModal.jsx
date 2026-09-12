import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal.jsx';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useCreateMaintenanceTicket } from '../hooks/useMaintenanceMutations';

const CATEGORIES = ['plumbing', 'electrical', 'carpentry', 'painting', 'appliance', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(PRIORITIES),
  scheduledDate: z.string().optional(),
});

export default function MaintenanceFormModal({ open, onClose, hostelId }) {
  const createTicket = useCreateMaintenanceTicket();
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { data: roomsData } = useRooms({ hostelId, limit: 5, search: roomSearch || undefined });
  const rooms = roomSearch ? roomsData?.data?.items ?? [] : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { priority: 'medium' } });

  const onSubmit = async (values) => {
    if (!selectedRoom) return;
    await createTicket.mutateAsync({
      ...values,
      hostelId,
      roomId: selectedRoom._id,
      scheduledDate: values.scheduledDate || undefined,
    });
    reset();
    setSelectedRoom(null);
    setRoomSearch('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Maintenance Ticket">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Room</label>
          {selectedRoom ? (
            <div className="flex items-center justify-between rounded-control border border-border px-3 py-2 text-sm">
              <span>Room {selectedRoom.roomNumber}</span>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="text-xs font-medium text-danger hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <input
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="Search room number…"
                className={inputClass}
              />
              {rooms.length > 0 && (
                <ul className="mt-1 max-h-32 overflow-y-auto rounded-control border border-border">
                  {rooms.map((r) => (
                    <li key={r._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRoom(r);
                          setRoomSearch('');
                        }}
                        className="block w-full px-3 py-1.5 text-left text-sm hover:bg-canvas"
                      >
                        Room {r.roomNumber}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
          <input {...register('title')} className={inputClass} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
          <textarea rows={3} {...register('description')} className={inputClass} />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <select {...register('category')} className={inputClass}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Priority</label>
            <select {...register('priority')} className={inputClass}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Scheduled date (optional)</label>
          <input type="date" {...register('scheduledDate')} className={inputClass} />
        </div>

        {createTicket.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {createTicket.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedRoom || createTicket.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createTicket.isPending ? 'Creating…' : 'Create ticket'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';