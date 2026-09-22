import { apiClient } from '@/lib/apiClient';

export const searchApi = {
  search: (hostelId, q) => apiClient.get('/search', { params: { hostelId, q } }),
};