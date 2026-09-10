import { useState } from 'react';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { useAuthStore, hasPermission } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useHostels, useCreateHostel } from '@/features/hostels/hooks/useHostels';

/**
 * Only rendered for users who can manage multiple hostels (Super Admin
 * today). Hostel-scoped staff roles, once built, will always operate on
 * their own hostel and never see this.
 */
export default function HostelSwitcher() {
  const user = useAuthStore((s) => s.user);
  const { selectedHostelId, selectedHostelName, setSelectedHostel } = useHostelStore();
  const { data, isLoading } = useHostels();
  const createHostel = useCreateHostel();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  if (!hasPermission(user, 'hostel.manage')) return null;

  const hostels = data?.data?.items ?? [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await createHostel.mutateAsync({ name: newName.trim() });
    setSelectedHostel(res.data.hostel._id, res.data.hostel.name);
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-control border border-border px-3 py-1.5 text-sm text-ink hover:bg-canvas"
      >
        <Building2 size={16} className="text-ink-muted" />
        <span className="max-w-[10rem] truncate">{selectedHostelName ?? 'Select hostel'}</span>
        <ChevronDown size={14} className="text-ink-muted" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-64 rounded-control border border-border bg-surface py-1 shadow-popover">
          {isLoading && <p className="px-3 py-2 text-sm text-ink-muted">Loading…</p>}
          {!isLoading && hostels.length === 0 && !creating && (
            <p className="px-3 py-2 text-sm text-ink-muted">No hostels yet.</p>
          )}
          {hostels.map((h) => (
            <button
              key={h._id}
              onClick={() => {
                setSelectedHostel(h._id, h.name);
                setOpen(false);
              }}
              className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-canvas ${
                h._id === selectedHostelId ? 'text-brand-600 font-medium' : 'text-ink'
              }`}
            >
              {h.name}
            </button>
          ))}

          <div className="border-t border-border px-3 py-2">
            {creating ? (
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Hostel name"
                  className="w-full rounded-control border border-border px-2 py-1 text-sm outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={createHostel.isPending}
                  className="shrink-0 rounded-control bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600"
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> New hostel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}