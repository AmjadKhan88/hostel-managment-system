import { useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';

/**
 * Restores the session on initial app load by calling /auth/me. A failure
 * here just means "not logged in" (e.g. first visit, expired cookie) — it's
 * expected, not an error to surface to the user.
 */
export function useSessionHydration() {
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    if (status !== 'idle') return;
    setStatus('loading');
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => clearUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
}