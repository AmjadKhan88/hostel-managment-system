import { apiClient } from '@/lib/apiClient';

export const portalApi = {
  invoices: (params) => apiClient.get('/portal/invoices', { params }),
  invoice: (id) => apiClient.get(`/portal/invoices/${id}`),
  payments: (params) => apiClient.get('/portal/payments', { params }),
  complaints: (params) => apiClient.get('/portal/complaints', { params }),
  complaint: (id) => apiClient.get(`/portal/complaints/${id}`),
  submitComplaint: (data) => apiClient.post('/portal/complaints', data),
  notices: (params) => apiClient.get('/portal/notices', { params }),
  profile: () => apiClient.get('/portal/profile'),
  updateProfile: (data) => apiClient.patch('/portal/profile', data),
  documents: () => apiClient.get('/portal/documents'),
  uploadDocument: (formData) => apiClient.post('/portal/documents', formData),
  deleteDocument: (id) => apiClient.delete(`/portal/documents/${id}`),
};
