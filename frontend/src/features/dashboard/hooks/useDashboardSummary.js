import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboardSummary(hostelId) {
  return useQuery({
    queryKey: ['dashboard', 'summary', hostelId],
    queryFn: () => dashboardApi.getSummary(hostelId),
    enabled: Boolean(hostelId),
  });
}