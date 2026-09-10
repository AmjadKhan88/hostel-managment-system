import { create } from 'zustand';

/**
 * Which hostel the UI is currently operating on. Only relevant for
 * Super Admin (who isn't tied to one hostel) — hostel-scoped staff, once
 * that role type exists, just use their own user.hostelId everywhere and
 * never see a switcher.
 */
export const useHostelStore = create((set) => ({
  selectedHostelId: null,
  selectedHostelName: null,
  setSelectedHostel: (id, name) => set({ selectedHostelId: id, selectedHostelName: name }),
}));