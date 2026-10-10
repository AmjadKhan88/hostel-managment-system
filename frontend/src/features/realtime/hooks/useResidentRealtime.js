import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getResidentSocket } from '@/lib/socket';
import { formatMoney } from '@/lib/money';
import { useResidentAuthStore } from '@/store/residentAuthStore';
import { useResidentNotificationsStore } from '@/store/residentNotificationsStore';
import { useToastStore } from '@/store/toastStore';

const INVOICE_KEYS = [
  ['portal', 'invoices'],
  ['portal', 'payments'],
];

const label = (status = '') => status.replace('_', ' ');

const RESIDENT_EVENTS = {
  'payment_submission:reviewed': {
    message: (p) =>
      p.status === 'approved'
        ? `Your payment of ${formatMoney(p.amountMinorUnits)} was approved`
        : `Your payment of ${formatMoney(p.amountMinorUnits)} was rejected${p.rejectionReason ? `: ${p.rejectionReason}` : ''}`,
    invalidate: [['portal', 'payment-submissions'], ...INVOICE_KEYS],
  },
  'payment:recorded': {
    message: (p) => `Payment of ${formatMoney(p.amountMinorUnits)} recorded (${p.receiptNumber})`,
    invalidate: INVOICE_KEYS,
  },
  'invoice:generated': {
    message: (p) => `New invoice ${p.invoiceNumber} for ${formatMoney(p.totalMinorUnits)}`,
    invalidate: [['portal', 'invoices']],
  },
  'complaint:updated': {
    message: (p) => `Your complaint "${p.subject}" is now ${label(p.status)}`,
    invalidate: [['portal', 'complaints']],
  },
  'complaint:commented': {
    message: (p) => `Staff replied to your complaint "${p.subject}"`,
    invalidate: [['portal', 'complaints']],
  },
  'maintenance:updated': {
    message: (p) => `Your maintenance request "${p.title}" is now ${label(p.status)}`,
    invalidate: [['portal', 'maintenance']],
  },
  'visitor:arrived': {
    message: (p) => `${p.visitorName} has arrived at the gate`,
    invalidate: [['portal', 'visitors']],
  },
  'notice:published': {
    message: (p) => `New notice: ${p.title}`,
    invalidate: [['portal', 'notices']],
  },
};

/** Connects the resident's own socket once they're signed in to the portal. */
export function useResidentRealtime() {
  const resident = useResidentAuthStore((s) => s.resident);
  const addNotification = useResidentNotificationsStore((s) => s.addNotification);
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const clearAll = useResidentNotificationsStore((s) => s.clearAll);

  useEffect(() => {
    if (!resident) clearAll();
  }, [resident, clearAll]);

  useEffect(() => {
    if (!resident) return undefined;

    const socket = getResidentSocket();
    socket.connect();

    const handlers = Object.entries(RESIDENT_EVENTS).map(([event, { message, invalidate }]) => {
      const handler = (payload) => {
        const text = message(payload);
        addNotification({
          id: `${event}-${Date.now()}`,
          event,
          message: text,
          at: new Date().toISOString(),
        });
        addToast(text);
        invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      };
      socket.on(event, handler);
      return [event, handler];
    });

    return () => {
      handlers.forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [resident, addNotification, addToast, queryClient]);
}
