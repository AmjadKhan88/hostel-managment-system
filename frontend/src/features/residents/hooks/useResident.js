import { useQuery } from '@tanstack/react-query';
import { residentsApi } from '../api/residentsApi';

export function useResident(id) {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: () => residentsApi.getById(id),
    enabled: Boolean(id),
  });
}