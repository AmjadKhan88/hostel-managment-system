import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useToastStore } from '@/store/toastStore';

const EVENT_MESSAGES = {
  'payment:recorded': (p) => `Payment of ${(p.amountMinorUnits / 100).toFixed(2)} recorded (${p.receiptNumber})`,
  'complaint:created': (p) => `New complaint: ${p.subject}`,
  'complaint:updated': (p) => `Complaint status changed to ${p.status.replace('_', ' ')}`,
  'admission:created': () => 'New admission application submitted',
  'visitor:arrived': (p) => `${p.visitorName} checked in to see ${p.residentName}`,
  'allocation:changed': (p) => `Room allocation ${p.type.replace('_', ' ')}`,
};

/**
 * Connects the shared socket once the user is authenticated and routes
 * every event into both the notification bell (persistent list) and a
 * transient toast. Mounted once at the App root.
 */
export function useRealtimeNotifications() {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (!user) return undefined;

    const socket = getSocket();
    socket.connect();

    const handlers = Object.entries(EVENT_MESSAGES).map(([event, formatMessage]) => {
      const handler = (payload) => {
        const message = formatMessage(payload);
        addNotification({ id: `${event}-${Date.now()}`, event, message, at: new Date().toISOString() });
        addToast(message);
      };
      socket.on(event, handler);
      return [event, handler];
    });

    return () => {
      handlers.forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [user, addNotification, addToast]);
}