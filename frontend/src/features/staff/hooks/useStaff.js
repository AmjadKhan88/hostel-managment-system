import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../api/staffApi';

export function useStaffList(params) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => staffApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}