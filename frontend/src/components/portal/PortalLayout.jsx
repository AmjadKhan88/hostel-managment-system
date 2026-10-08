import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, LogOut, Home, FileText, Wallet, MessageSquareWarning, Megaphone, User, Wrench, Contact } from 'lucide-react';
import { useResidentAuthStore } from '@/store/residentAuthStore';
import { useResidentNotificationsStore } from '@/store/residentNotificationsStore';
import { usePortalLogout } from '@/features/portalAuth/hooks/usePortalAuth';
import NotificationMenu from '@/components/layout/NotificationMenu.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, path: '/portal' },
  { label: 'Invoices', icon: FileText, path: '/portal/invoices' },
  { label: 'Payments', icon: Wallet, path: '/portal/payments' },
  { label: 'Complaints', icon: MessageSquareWarning, path: '/portal/complaints' },
  { label: 'Maintenance', icon: Wrench, path: '/portal/maintenance' },
  { label: 'Visitors', icon: Contact, path: '/portal/visitors' },
  { label: 'Notices', icon: Megaphone, path: '/portal/notices' },
  { label: 'Profile', icon: User, path: '/portal/profile' },
];

function SidebarContent({ resident, onLogout, onNavigate }) {
  const initials = resident?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-500 text-sm font-bold text-white">
          H
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">Resident</p>
          <p className="text-sm font-semibold text-ink">Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/portal'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-canvas hover:text-ink'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-control px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{resident?.name}</p>
            <p className="truncate text-xs text-ink-subtle">{resident?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-canvas hover:text-danger"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function PortalLayout() {
  const resident = useResidentAuthStore((s) => s.resident);
  const { mutate: logout } = usePortalLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
        <SidebarContent resident={resident} onLogout={logout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-control p-2 text-ink-muted hover:bg-canvas"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent resident={resident} onLogout={logout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-control p-2 text-ink-muted hover:bg-canvas md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-ink md:hidden">Resident Portal</span>
          </div>
          <NotificationMenu useStore={useResidentNotificationsStore} />
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}