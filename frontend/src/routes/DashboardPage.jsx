import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useAuthStore } from '@/store/authStore';

const tokenSwatches = [
  { name: 'brand.500', className: 'bg-brand-500' },
  { name: 'success', className: 'bg-success' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'warning', className: 'bg-warning' },
];

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useHealthCheck();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Occupancy stats, revenue, and activity charts are built on the Dashboard Data day — this
          confirms the application shell is wired correctly in the meantime.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="text-sm font-semibold text-ink">Frontend toolchain</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>✅ React + Vite dev server running</li>
            <li>✅ Tailwind design tokens loaded</li>
            <li>✅ Auth store + protected routing active</li>
            <li>✅ Sidebar + Topbar shell active</li>
          </ul>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-sm font-semibold text-ink">Backend connectivity</h2>
          {isLoading && <p className="mt-3 text-sm text-ink-muted">Checking /api/v1/health…</p>}
          {isError && (
            <div className="mt-3 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger">
              Could not reach the API ({error?.message ?? 'unknown error'}). Start the backend
              with <code>npm run dev</code> in <code>/backend</code>.
            </div>
          )}
          {data && (
            <div className="mt-3 rounded-control bg-success-bg px-3 py-2 text-sm text-success">
              API is healthy — database: {data.data.database}, uptime: {data.data.uptimeSeconds}s
            </div>
          )}
        </section>
      </div>

      {user && (
        <section className="surface-card mt-4 p-6">
          <h2 className="text-sm font-semibold text-ink">Signed-in user &amp; permissions</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {user.name} — role: <span className="font-medium text-ink">{user.role.name}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {user.role.permissions.map((p) => (
              <span
                key={p}
                className="rounded-pill bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="surface-card mt-4 p-6">
        <h2 className="text-sm font-semibold text-ink">Design tokens (from reference dashboard)</h2>
        <div className="mt-3 flex items-center gap-4">
          {tokenSwatches.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1.5">
              <span className={`h-10 w-10 rounded-control ${t.className}`} />
              <span className="text-xs text-ink-subtle">{t.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}