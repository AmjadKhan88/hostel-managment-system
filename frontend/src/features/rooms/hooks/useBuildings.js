import { useQuery } from '@tanstack/react-query';
import { buildingsApi } from '../api/roomsApi';

export function useBuildings(hostelId) {
  return useQuery({
    queryKey: ['buildings', hostelId],
    queryFn: () => buildingsApi.list(hostelId),
    enabled: Boolean(hostelId),
  });
}