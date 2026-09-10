import { useAllocationHistory } from '../hooks/useAllocationHistory';

export default function AllocationHistory({ residentId }) {
  const { data, isLoading } = useAllocationHistory(residentId);
  const allocations = data?.data?.allocations ?? [];

  if (isLoading || allocations.length === 0) return null;

  return (
    <section className="surface-card mt-4 p-6">
      <h2 className="text-sm font-semibold text-ink">Allocation history</h2>
      <ul className="mt-3 space-y-2">
        {allocations.map((a) => (
          <li key={a._id} className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">
              {new Date(a.allocatedAt).toLocaleDateString()}
              {a.endedAt && ` – ${new Date(a.endedAt).toLocaleDateString()}`}
            </span>
            <span className={`text-xs font-medium ${a.status === 'active' ? 'text-success' : 'text-ink-subtle'}`}>
              {a.status === 'active' ? 'Active' : a.endReason === 'transfer' ? 'Transferred out' : 'Checked out'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}