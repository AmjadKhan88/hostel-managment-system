import { useMutation, useQueryClient } from '@tanstack/react-query';
import { residentsApi } from '../api/residentsApi';

export function useCreateResident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: residentsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['residents'] }),
  });
}

export function useUpdateResident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => residentsApi.update(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.setQueryData(['residents', variables.id], res);
    },
  });
}