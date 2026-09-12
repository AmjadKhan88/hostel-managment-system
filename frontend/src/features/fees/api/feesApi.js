import { apiClient } from '@/lib/apiClient';

export const feeStructuresApi = {
  list: (hostelId) => apiClient.get('/fee-structures', { params: { hostelId } }),
  create: (data) => apiClient.post('/fee-structures', data),
  update: (id, data) => apiClient.patch(`/fee-structures/${id}`, data),
};

export const invoicesApi = {
  list: (params) => apiClient.get('/invoices', { params }),
  getById: (id) => apiClient.get(`/invoices/${id}`),
  create: (data) => apiClient.post('/invoices', data),
  void: (id) => apiClient.post(`/invoices/${id}/void`),
  outstandingBalances: (hostelId) => apiClient.get('/invoices/outstanding-balances', { params: { hostelId } }),
};

export const paymentsApi = {
  list: (params) => apiClient.get('/payments', { params }),
  create: (data) => apiClient.post('/payments', data),
  refund: (id, data) => apiClient.post(`/payments/${id}/refund`, data),
};