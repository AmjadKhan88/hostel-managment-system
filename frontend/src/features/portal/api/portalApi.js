import { apiClient } from '@/lib/apiClient';

export const portalApi = {
  invoices: (params) => apiClient.get('/portal/invoices', { params }),
  invoice: (id) => apiClient.get(`/portal/invoices/${id}`),
  payments: (params) => apiClient.get('/portal/payments', { params }),
  complaints: (params) => apiClient.get('/portal/complaints', { params }),
  complaint: (id) => apiClient.get(`/portal/complaints/${id}`),
  submitComplaint: (data) => apiClient.post('/portal/complaints', data),
  notices: (params) => apiClient.get('/portal/notices', { params }),
};
