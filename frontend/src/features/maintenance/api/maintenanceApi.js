import { apiClient } from '@/lib/apiClient';

export const maintenanceApi = {
  list: (params) => apiClient.get('/maintenance', { params }),
  getById: (id) => apiClient.get(`/maintenance/${id}`),
  create: (data) => apiClient.post('/maintenance', data),
  update: (id, data) => apiClient.patch(`/maintenance/${id}`, data),
};