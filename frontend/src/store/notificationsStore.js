import { create } from 'zustand';

export const useNotificationsStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 30),
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () => set({ unreadCount: 0 }),
}));