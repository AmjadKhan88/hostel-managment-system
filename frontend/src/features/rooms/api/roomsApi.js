import { apiClient } from '@/lib/apiClient';

export const roomsApi = {
  list: (params) => apiClient.get('/rooms', { params }),
  create: (data) => apiClient.post('/rooms', data),
  update: (id, data) => apiClient.patch(`/rooms/${id}`, data),
};

export const buildingsApi = {
  list: (hostelId) => apiClient.get('/buildings', { params: { hostelId } }),
  create: (data) => apiClient.post('/buildings', data),
  addFloor: (buildingId, data) => apiClient.post(`/buildings/${buildingId}/floors`, data),
};