import { apiClient } from '@/lib/apiClient';

export const noticesApi = {
  list: (params) => apiClient.get('/notices', { params }),
  create: (data) => apiClient.post('/notices', data),
  update: (id, data) => apiClient.patch(`/notices/${id}`, data),
  remove: (id) => apiClient.delete(`/notices/${id}`),
};