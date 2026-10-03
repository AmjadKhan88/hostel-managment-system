import { useMutation } from '@tanstack/react-query';
import { portalAuthApi } from '../api/portalAuthApi';
import { useResidentAuthStore } from '@/store/residentAuthStore';

export function usePortalLogin() {
  const setResident = useResidentAuthStore((s) => s.setResident);
  return useMutation({
    mutationFn: portalAuthApi.login,
    onSuccess: (res) => setResident(res.data.resident),
  });
}

export function usePortalLogout() {
  const clearResident = useResidentAuthStore((s) => s.clearResident);
  return useMutation({
    mutationFn: portalAuthApi.logout,
    onSettled: () => clearResident(),
  });
}

export function useSetupAccount() {
  return useMutation({ mutationFn: portalAuthApi.setupAccount });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: portalAuthApi.requestPasswordReset });
}

export function useResetPassword() {
  return useMutation({ mutationFn: portalAuthApi.resetPassword });
}
