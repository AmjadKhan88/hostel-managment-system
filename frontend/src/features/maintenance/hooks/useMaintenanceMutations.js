import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenanceApi';

export function useCreateMaintenanceTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}

export function useUpdateMaintenanceTicket(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => maintenanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
    },
  });
}