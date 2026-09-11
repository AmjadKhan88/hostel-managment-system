import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitorsApi } from '../api/visitorsApi';

export function useVisitors(params) {
  return useQuery({
    queryKey: ['visitors', params],
    queryFn: () => visitorsApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useCheckInVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitorsApi.checkIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] }),
  });
}

export function useCheckOutVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitorsApi.checkOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] }),
  });
}