import { apiClient } from '@/lib/apiClient';

export const complaintsApi = {
  list: (params) => apiClient.get('/complaints', { params }),
  getById: (id) => apiClient.get(`/complaints/${id}`),
  create: (data) => apiClient.post('/complaints', data),
  update: (id, data) => apiClient.patch(`/complaints/${id}`, data),
  addComment: (id, text) => apiClient.post(`/complaints/${id}/comments`, { text }),
};