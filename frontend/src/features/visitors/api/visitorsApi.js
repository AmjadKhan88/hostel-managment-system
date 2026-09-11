import { apiClient } from '@/lib/apiClient';

export const visitorsApi = {
  list: (params) => apiClient.get('/visitors', { params }),
  checkIn: (data) => apiClient.post('/visitors', data),
  checkOut: (id) => apiClient.post(`/visitors/${id}/checkout`),
};