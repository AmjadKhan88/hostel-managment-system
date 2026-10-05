import { apiClient } from '@/lib/apiClient';

export const visitorsApi = {
  list: (params) => apiClient.get('/visitors', { params }),
  checkIn: (data) => apiClient.post('/visitors', data),
  checkInExpected: (id) => apiClient.post(`/visitors/${id}/checkin`),
  checkOut: (id) => apiClient.post(`/visitors/${id}/checkout`),
};
