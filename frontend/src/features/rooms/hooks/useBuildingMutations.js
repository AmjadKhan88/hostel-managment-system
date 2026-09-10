import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingsApi } from '../api/roomsApi';

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: buildingsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buildings'] }),
  });
}

export function useAddFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ buildingId, data }) => buildingsApi.addFloor(buildingId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buildings'] }),
  });
}