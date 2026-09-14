import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';

export default function NotificationMenu() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open) markAllRead();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-control p-2 text-ink-muted hover:bg-canvas"
        aria-label="Notifications"
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
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-ink">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-ink-muted">
                Nothing yet — live updates will appear here.
              </p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="border-b border-border px-3 py-2.5 last:border-0">
                <p className="text-sm text-ink">{n.message}</p>
                <p className="mt-0.5 text-xs text-ink-subtle">{new Date(n.at).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}