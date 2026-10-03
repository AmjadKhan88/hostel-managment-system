import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, LogOut, Home, FileText, Wallet, MessageSquareWarning, Megaphone, User } from 'lucide-react';
import { useResidentAuthStore } from '@/store/residentAuthStore';
import { usePortalLogout } from '@/features/portalAuth/hooks/usePortalAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, path: '/portal' },
  { label: 'Invoices', icon: FileText, path: '/portal/invoices' },
  { label: 'Payments', icon: Wallet, path: '/portal/payments' },
  { label: 'Complaints', icon: MessageSquareWarning, path: '/portal/complaints' },
  { label: 'Notices', icon: Megaphone, path: '/portal/notices' },
  { label: 'Profile', icon: User, path: '/portal/profile' },
];

export default function PortalLayout() {
  const resident = useResidentAuthStore((s) => s.resident);
  const { mutate: logout } = usePortalLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = resident?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-500 text-sm font-bold text-white">
              H
            </span>
            <span className="hidden text-sm font-semibold text-ink sm:block">Resident Portal</span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-control px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-canvas hover:text-ink'
                  }`
                }
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 sm:flex">
              {initials}
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-control px-3 py-2 text-sm font-medium text-ink-muted hover:bg-canvas hover:text-danger"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-control p-2 text-ink-muted hover:bg-canvas md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border px-4 py-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-control px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-canvas'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}