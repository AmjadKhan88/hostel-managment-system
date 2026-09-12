import { useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '../api/maintenanceApi';

export function useMaintenanceTickets(params) {
  return useQuery({
    queryKey: ['maintenance', params],
    queryFn: () => maintenanceApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useMaintenanceTicket(id) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceApi.getById(id),
    enabled: Boolean(id),
  });
}