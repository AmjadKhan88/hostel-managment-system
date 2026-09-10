import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';

export default function Topbar({ onOpenMobileSidebar }) {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-control p-2 text-ink-muted hover:bg-canvas lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            placeholder="Search anything…"
            disabled
            title="Global search is built on its own scoped day"
            className="w-full rounded-control border border-border bg-canvas py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative rounded-control p-2 text-ink-muted hover:bg-canvas"
          aria-label="Notifications"
          disabled
          title="Notifications are built on the real-time features day"
        >
          <Bell size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-control px-2 py-1.5 hover:bg-canvas"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initials}
            </span>
            <ChevronDown size={16} className="hidden text-ink-muted sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-control border border-border bg-surface py-1 shadow-popover">
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-bg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}