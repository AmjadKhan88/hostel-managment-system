import { apiClient } from '@/lib/apiClient';

export const dashboardApi = {
  getSummary: (hostelId) => apiClient.get('/dashboard/summary', { params: { hostelId } }),
};