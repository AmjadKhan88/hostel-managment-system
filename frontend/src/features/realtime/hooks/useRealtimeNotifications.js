import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { formatMoney } from '@/lib/money';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useToastStore } from '@/store/toastStore';

function describeReminder(reminder) {
  if (!reminder) return '';
  const channels = reminder.channels
    ? Object.entries(reminder.channels)
        .map(([name, r]) => `${name}: ${r.status}${r.detail ? ` (${r.detail})` : ''}`)
        .join(', ')
    : '';

  switch (reminder.state) {
    case 'sent':
      return ` — reminder ${reminder.round}/${reminder.maxRounds} sent (${channels})`;
    case 'not_delivered':
      return ` — reminder NOT delivered (${channels})`;
    case 'waiting_interval':
      return ` — ${reminder.roundsCompleted}/${reminder.maxRounds} reminders sent, next one due soon`;
    case 'max_reminders_reached':
      return ' — all reminders sent, follow up manually';
    case 'no_resident':
      return ' — resident record missing';
    default:
      return '';
  }
}

// Events that produce a toast + bell entry.
const EVENT_MESSAGES = {
  'payment:recorded': (p) =>
    `Payment of ${(p.amountMinorUnits / 100).toFixed(2)} recorded (${p.receiptNumber})`,
  'complaint:created': (p) => `New complaint: ${p.subject}`,
  'complaint:updated': (p) => `Complaint status changed to ${p.status.replace('_', ' ')}`,
  'admission:created': () => 'New admission application submitted',
  'visitor:arrived': (p) => `${p.visitorName} checked in to see ${p.residentName}`,
  'visitor:expected': (p) => `${p.residentName} pre-registered a visitor: ${p.visitorName}`,
  'visitor:cancelled': (p) =>
    `${p.residentName} cancelled the expected visit from ${p.visitorName}`,
  'allocation:changed': (p) => `Room allocation ${p.type.replace('_', ' ')}`,
  'invoice:generated': (p) => `Invoice ${p.invoiceNumber} generated automatically`,
  'payment:overdue': (p) =>
    `${p.invoiceNumber} is ${p.daysOverdue}d overdue (${p.residentName})${describeReminder(p.reminder)}`,
  'payment_submission:created': (p) =>
    `${p.residentName} submitted a payment of ${formatMoney(p.amountMinorUnits)} for review`,
  'maintenance:created': (p) => `New maintenance request: ${p.title}`,
  'expense:generated': (p) =>
    `Recurring expense added: ${p.title} (${formatMoney(p.amountMinorUnits)})`,
};

// Which cached lists to refresh when an event arrives, so open pages
// update instantly instead of waiting for a poll. 'payment_submission:reviewed'
// refreshes the queue silently — the reviewer already sees the result, so
// no toast, but a second admin's open queue updates live.
const INVALIDATIONS = {
  'payment_submission:created': [['payment-submissions']],
  'payment_submission:reviewed': [['payment-submissions']],
  'visitor:arrived': [['visitors']],
  'visitor:expected': [['visitors']],
  'visitor:cancelled': [['visitors']],
  'complaint:created': [['complaints']],
  'complaint:updated': [['complaints']],
  'maintenance:created': [['maintenance']],
  'expense:generated': [['expenses'], ['finance']],
};

const ALL_EVENTS = [...new Set([...Object.keys(EVENT_MESSAGES), ...Object.keys(INVALIDATIONS)])];

/**
 * Connects the staff socket once authenticated and routes every event into
 * the notification bell, a toast, and cache invalidation. Mounted once at
 * the App root.
 */
export function useRealtimeNotifications() {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return undefined;

    const socket = getSocket();
    socket.connect();

    const handlers = ALL_EVENTS.map((event) => {
      const handler = (payload) => {
        const formatMessage = EVENT_MESSAGES[event];
        if (formatMessage) {
          const message = formatMessage(payload);
          addNotification({
            id: `${event}-${Date.now()}`,
            event,
            message,
            at: new Date().toISOString(),
          });
          addToast(message);
        }
        (INVALIDATIONS[event] ?? []).forEach((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        );
      };
      socket.on(event, handler);
      return [event, handler];
    });

    return () => {
      handlers.forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [user, addNotification, addToast, queryClient]);
}
