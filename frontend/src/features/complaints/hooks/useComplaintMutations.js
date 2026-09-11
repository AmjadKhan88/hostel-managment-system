import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '../api/complaintsApi';

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complaintsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complaints'] }),
  });
}

export function useUpdateComplaint(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => complaintsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints', id] });
    },
  });
}

export function useAddComment(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) => complaintsApi.addComment(id, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complaints', id] }),
  });
}