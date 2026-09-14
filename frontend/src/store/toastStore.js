import { create } from 'zustand';

let idCounter = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, variant = 'info') => {
    const id = ++idCounter;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));