import { create } from 'zustand';

export const useResidentAuthStore = create((set) => ({
  resident: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

  setResident: (resident) => set({ resident, status: 'authenticated' }),
  clearResident: () => set({ resident: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));
