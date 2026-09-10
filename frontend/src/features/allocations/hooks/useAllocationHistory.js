import { useQuery } from '@tanstack/react-query';
import { allocationsApi } from '../api/allocationsApi';

export function useAllocationHistory(residentId) {
  return useQuery({
    queryKey: ['allocations', residentId],
    queryFn: () => allocationsApi.history(residentId),
    enabled: Boolean(residentId),
  });
}