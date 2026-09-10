import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { navSections, settingsNavItem } from '@/config/navigation';
import { useAuthStore, hasPermission } from '@/store/authStore';

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-border bg-surface transition-all duration-200
          ${collapsed ? 'lg:w-sidebar-collapsed' : 'lg:w-sidebar'}
          ${mobileOpen ? 'w-sidebar translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-500 text-sm font-bold text-white">
              H
            </span>
            {!collapsed && <span className="truncate text-sm font-semibold text-ink">Hostel MS</span>}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-control p-1.5 text-ink-muted hover:bg-canvas lg:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navSections.map((section, i) => (
            <div key={section.title ?? i}>
              {section.title && !collapsed && (
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.label} item={item} collapsed={collapsed} user={user} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <NavItem item={settingsNavItem} collapsed={collapsed} user={user} />
        </div>
      </aside>
    </>
  );
}

function NavItem({ item, collapsed, user }) {
  const Icon = item.icon;
  const isImplemented = Boolean(item.path);
  const isAllowed = !item.permission || hasPermission(user, item.permission);

  if (!isImplemented || !isAllowed) {
    return (
      <li>
        <div
          className="flex cursor-not-allowed items-center gap-3 rounded-control px-3 py-2 text-sm text-ink-subtle"
          title={!isAllowed ? "You don't have permission for this" : 'Coming soon'}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && (
            <span className="flex flex-1 items-center justify-between">
              {item.label}
              {isImplemented ? null : (
                <span className="rounded-pill bg-canvas px-2 py-0.5 text-[10px] font-medium text-ink-subtle">
                  Soon
                </span>
              )}
            </span>
          )}
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.path}
        end={item.path === '/'}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition ${
            isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-canvas hover:text-ink'
          }`
        }
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    </li>
  );
}