import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBuildings } from '../hooks/useBuildings';
import { useCreateBuilding, useAddFloor } from '../hooks/useBuildingMutations';

/**
 * Minimal buildings/floors setup so the Room form has somewhere to point
 * roomNumber → buildingId/floorId at. A dedicated Buildings management
 * page (bulk edit, deactivate, etc.) isn't in scope yet — this covers just
 * enough to unblock creating rooms.
 */
export default function BuildingQuickSetup({ hostelId }) {
  const { data } = useBuildings(hostelId);
  const createBuilding = useCreateBuilding();
  const addFloor = useAddFloor();
  const [newBuilding, setNewBuilding] = useState('');
  const [floorInputs, setFloorInputs] = useState({});

  const buildings = data?.data?.buildings ?? [];

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    if (!newBuilding.trim()) return;
    await createBuilding.mutateAsync({ hostelId, name: newBuilding.trim() });
    setNewBuilding('');
  };

  const handleAddFloor = async (buildingId) => {
    const name = floorInputs[buildingId]?.trim();
    if (!name) return;
    await addFloor.mutateAsync({ buildingId, data: { name } });
    setFloorInputs((s) => ({ ...s, [buildingId]: '' }));
  };

  return (
    <div className="surface-card mb-4 p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink">Buildings &amp; Floors</h2>

      <div className="space-y-3">
        {buildings.map((b) => (
          <div key={b._id} className="rounded-control border border-border p-3">
            <p className="text-sm font-medium text-ink">{b.name}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {b.floors.map((f) => (
                <span key={f._id} className="rounded-pill bg-canvas px-2 py-0.5 text-xs text-ink-muted">
                  {f.name}
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={floorInputs[b._id] ?? ''}
                onChange={(e) => setFloorInputs((s) => ({ ...s, [b._id]: e.target.value }))}
                placeholder="New floor name"
                className="w-full max-w-[10rem] rounded-control border border-border px-2 py-1 text-xs outline-none focus:border-brand-500"
              />
              <button
                onClick={() => handleAddFloor(b._id)}
                className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                + Add floor
              </button>
            </div>
          </div>
        ))}

        <form onSubmit={handleAddBuilding} className="flex gap-2">
          <input
            value={newBuilding}
            onChange={(e) => setNewBuilding(e.target.value)}
            placeholder="New building name"
            className="w-full max-w-xs rounded-control border border-border px-3 py-1.5 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={createBuilding.isPending}
            className="flex items-center gap-1 rounded-control bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
          >
            <Plus size={14} /> Add building
          </button>
        </form>
      </div>
    </div>
  );
}