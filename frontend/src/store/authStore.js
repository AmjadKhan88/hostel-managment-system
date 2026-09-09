import { create } from 'zustand';

/**
 * Holds the current authenticated user (from /auth/me), not server data in
 * general — server state stays in TanStack Query. `status` distinguishes
 * "haven't checked yet" from "checked and logged out" so ProtectedRoute
 * doesn't flash a redirect before hydration finishes.
 */
export const useAuthStore = create((set) => ({
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

  setUser: (user) => set({ user, status: 'authenticated' }),
  clearUser: () => set({ user: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));

export function hasPermission(user, permission) {
  if (!user) return false;
  const perms = user.role?.permissions ?? [];
  return perms.includes('*') || perms.includes(permission);
}