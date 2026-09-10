import { apiClient } from '@/lib/apiClient';

export const residentsApi = {
  list: (params) => apiClient.get('/residents', { params }),
  getById: (id) => apiClient.get(`/residents/${id}`),
  create: (data) => apiClient.post('/residents', data),
  update: (id, data) => apiClient.patch(`/residents/${id}`, data),
};