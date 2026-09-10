import { useMutation, useQueryClient } from '@tanstack/react-query';
import { allocationsApi } from '../api/allocationsApi';

function useInvalidateAfterAllocationChange(residentId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['allocations', residentId] });
    queryClient.invalidateQueries({ queryKey: ['residents'] });
    queryClient.invalidateQueries({ queryKey: ['residents', residentId] });
    queryClient.invalidateQueries({ queryKey: ['beds'] });
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
  };
}

export function useAllocateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: allocationsApi.allocate,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['residents', variables.residentId] });
      queryClient.invalidateQueries({ queryKey: ['allocations', variables.residentId] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
    },
  });
}

export function useTransferResident(residentId) {
  const invalidate = useInvalidateAfterAllocationChange(residentId);
  return useMutation({
    mutationFn: (data) => allocationsApi.transfer(residentId, data),
    onSuccess: invalidate,
  });
}

export function useCheckoutResident(residentId) {
  const invalidate = useInvalidateAfterAllocationChange(residentId);
  return useMutation({
    mutationFn: () => allocationsApi.checkout(residentId),
    onSuccess: invalidate,
  });
}