import { apiClient } from '@/lib/apiClient';

export const admissionsApi = {
  list: (params) => apiClient.get('/admissions', { params }),
  getById: (id) => apiClient.get(`/admissions/${id}`),
  create: (data) => apiClient.post('/admissions', data),
  approve: (id, data) => apiClient.post(`/admissions/${id}/approve`, data),
  reject: (id, data) => apiClient.post(`/admissions/${id}/reject`, data),
  waitlist: (id, data) => apiClient.post(`/admissions/${id}/waitlist`, data),
  verifyDocuments: (id) => apiClient.post(`/admissions/${id}/verify-documents`),
  checkIn: (id, data) => apiClient.post(`/admissions/${id}/check-in`, data),
  cancel: (id) => apiClient.post(`/admissions/${id}/cancel`),
};