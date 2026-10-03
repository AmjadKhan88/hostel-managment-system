import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useResidentAuthStore } from '@/store/residentAuthStore';

export default function PortalProtectedRoute() {
  const status = useResidentAuthStore((s) => s.status);
  const resident = useResidentAuthStore((s) => s.resident);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (!resident) {
    return <Navigate to="/portal/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}