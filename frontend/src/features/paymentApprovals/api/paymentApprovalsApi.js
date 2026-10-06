import { apiClient } from '@/lib/apiClient';

export const paymentApprovalsApi = {
  list: (params) => apiClient.get('/payment-submissions', { params }),
  get: (id) => apiClient.get(`/payment-submissions/${id}`),
  approve: (id) => apiClient.post(`/payment-submissions/${id}/approve`),
  reject: (id, reason) => apiClient.post(`/payment-submissions/${id}/reject`, { reason }),
};
