import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';

export default function NotificationMenu({ useStore = useNotificationsStore }) {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markRead);
  const markAllRead = useStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-control p-2 text-ink-muted hover:bg-canvas"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-control border border-border bg-surface py-1 shadow-popover">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-ink">Notifications</p>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-ink-subtle"
            >
              <CheckCheck size={13} /> Mark all as read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-ink-muted">
                Nothing yet — live updates will appear here.
              </p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className={`flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-canvas ${n.read ? '' : 'bg-brand-50'
                  }`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand-500'}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${n.read ? 'text-ink-muted' : 'font-medium text-ink'}`}>
                    {n.message}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-subtle">{new Date(n.at).toLocaleTimeString()}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}