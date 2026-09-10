import { apiClient } from '@/lib/apiClient';

export const rolesApi = {
  list: (hostelId) => apiClient.get('/roles', { params: { hostelId } }),
  create: (data) => apiClient.post('/roles', data),
  update: (id, data) => apiClient.patch(`/roles/${id}`, data),
};

export const staffApi = {
  list: (params) => apiClient.get('/staff', { params }),
  create: (data) => apiClient.post('/staff', data),
  update: (id, data) => apiClient.patch(`/staff/${id}`, data),
};

export const metaApi = {
  permissions: () => apiClient.get('/meta/permissions'),
};