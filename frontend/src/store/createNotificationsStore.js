import { create } from 'zustand';

const MAX_NOTIFICATIONS = 30;
let sequence = 0;

/**
 * Staff and residents each get their own instance (separate stores, same
 * behaviour). The store assigns the id itself — a timestamp alone can
 * collide when two events land in the same millisecond, and marking one read
 * would then mark both.
 */
export function createNotificationsStore() {
  return create((set) => ({
    notifications: [],

    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          { ...notification, id: `${Date.now()}-${(sequence += 1)}`, read: false },
          ...state.notifications,
        ].slice(0, MAX_NOTIFICATIONS),
      })),

    markRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),

    markAllRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => (n.read ? n : { ...n, read: true })),
      })),

    clearAll: () => set({ notifications: [] }),
  }));
}
