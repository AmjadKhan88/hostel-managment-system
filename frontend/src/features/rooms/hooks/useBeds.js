import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bedsApi } from '../api/roomsApi';

export function useBeds(roomId) {
  return useQuery({
    queryKey: ['beds', roomId],
    queryFn: () => bedsApi.list(roomId),
    enabled: Boolean(roomId),
  });
}

export function useCreateBed(roomId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => bedsApi.create(roomId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beds', roomId] }),
  });
}

export function useUpdateBedStatus(roomId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bedId, status }) => bedsApi.updateStatus(roomId, bedId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beds', roomId] }),
  });
}