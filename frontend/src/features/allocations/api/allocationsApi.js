import { apiClient } from '@/lib/apiClient';

export const allocationsApi = {
  allocate: (data) => apiClient.post('/allocations', data),
  transfer: (residentId, data) => apiClient.post(`/allocations/${residentId}/transfer`, data),
  checkout: (residentId) => apiClient.post(`/allocations/${residentId}/checkout`),
  history: (residentId) => apiClient.get(`/allocations/${residentId}/history`),
};