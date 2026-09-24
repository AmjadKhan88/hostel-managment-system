import { apiClient } from '@/lib/apiClient';

export const auditApi = {
  list: (params) => apiClient.get('/audit-logs', { params }),
};