import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesApi } from '../api/noticesApi';

export function useNotices(params) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => noticesApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: noticesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => noticesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: noticesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
  });
}