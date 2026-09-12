import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feeStructuresApi } from '../api/feesApi';

export function useFeeStructures(hostelId) {
  return useQuery({
    queryKey: ['fee-structures', hostelId],
    queryFn: () => feeStructuresApi.list(hostelId),
    enabled: Boolean(hostelId),
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feeStructuresApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fee-structures'] }),
  });
}