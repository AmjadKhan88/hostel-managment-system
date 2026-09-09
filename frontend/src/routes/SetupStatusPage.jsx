import { useHealthCheck } from '@/hooks/useHealthCheck';

const tokenSwatches = [
  { name: 'brand.500', className: 'bg-brand-500' },
  { name: 'success', className: 'bg-success' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'warning', className: 'bg-warning' },
];

export default function SetupStatusPage() {
  const { data, isLoading, isError, error } = useHealthCheck();

  return (
    <div className="min-h-screen bg-canvas px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-brand-600">Hostel Management System</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Day 1 — Project Setup</h1>
          <p className="mt-2 text-sm text-ink-muted">
            This page exists to verify the toolchain, not as the product UI. The real dashboard
            layout is built on its scoped day, using this same token system.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="surface-card p-6">
            <h2 className="text-sm font-semibold text-ink">Frontend toolchain</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li>✅ React + Vite dev server running</li>
              <li>✅ Tailwind design tokens loaded</li>
              <li>✅ React Router mounted</li>
              <li>✅ TanStack Query provider mounted</li>
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
    </div>
  );
}
