import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentsApi } from '../api/residentsApi';

export function useResident(id) {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: () => residentsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useInvitePortalAccount(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => residentsApi.invitePortal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['residents', id] }),
  });
}
