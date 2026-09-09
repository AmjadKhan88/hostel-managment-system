import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get('/health'),
    retry: 0,
    refetchOnMount: true,
  });
}
