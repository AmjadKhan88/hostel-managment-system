import { useQuery } from '@tanstack/react-query';
import { admissionsApi } from '../api/admissionsApi';

export function useAdmissions(params) {
  return useQuery({
    queryKey: ['admissions', params],
    queryFn: () => admissionsApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useAdmission(id) {
  return useQuery({
    queryKey: ['admissions', id],
    queryFn: () => admissionsApi.getById(id),
    enabled: Boolean(id),
  });
}