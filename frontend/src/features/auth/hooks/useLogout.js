import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => clearUser(), // clear locally even if the request itself failed
  });
}