import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hostelsApi } from '../api/hostelsApi';

export function useHostels() {
  return useQuery({ queryKey: ['hostels'], queryFn: hostelsApi.list });
}

export function useCreateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hostelsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostels'] }),
  });
}