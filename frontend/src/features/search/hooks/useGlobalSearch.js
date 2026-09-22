import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';

export function useGlobalSearch(hostelId, query) {
  return useQuery({
    queryKey: ['search', hostelId, query],
    queryFn: () => searchApi.search(hostelId, query),
    enabled: Boolean(hostelId) && query.trim().length >= 2,
  });
}