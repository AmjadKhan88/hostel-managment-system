import { useQuery } from '@tanstack/react-query';
import { residentsApi } from '../api/residentsApi';

export function useResidents(params) {
  return useQuery({
    queryKey: ['residents', params],
    queryFn: () => residentsApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}