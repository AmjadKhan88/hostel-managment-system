import { apiClient } from '@/lib/apiClient';

export const hostelsApi = {
  list: () => apiClient.get('/hostels', { params: { limit: 100 } }),
  create: (data) => apiClient.post('/hostels', data),
};