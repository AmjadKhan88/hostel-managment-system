import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '../api/complaintsApi';

export function useComplaints(params) {
  return useQuery({
    queryKey: ['complaints', params],
    queryFn: () => complaintsApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useComplaint(id) {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: () => complaintsApi.getById(id),
    enabled: Boolean(id),
  });
}