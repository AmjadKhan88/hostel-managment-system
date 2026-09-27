import { apiClient } from '@/lib/apiClient';

export const financeApi = {
  overview: (hostelId, month) =>
    apiClient.get('/finance/overview', { params: { hostelId, month } }),
};

export const expensesApi = {
  list: (params) => apiClient.get('/expenses', { params }),
  create: (data) => apiClient.post('/expenses', data),
  update: (id, data) => apiClient.patch(`/expenses/${id}`, data),
  remove: (id) => apiClient.delete(`/expenses/${id}`),
};
