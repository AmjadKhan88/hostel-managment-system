import { apiClient } from '@/lib/apiClient';

export const reportsApi = {
  occupancy: (params) => apiClient.get('/reports/occupancy', { params }),
  feeCollection: (params) => apiClient.get('/reports/fee-collection', { params }),
  outstandingDues: (params) => apiClient.get('/reports/outstanding-dues', { params }),
  admissions: (params) => apiClient.get('/reports/admissions', { params }),
  complaints: (params) => apiClient.get('/reports/complaints', { params }),
  maintenance: (params) => apiClient.get('/reports/maintenance', { params }),
  visitors: (params) => apiClient.get('/reports/visitors', { params }),
};