import { apiClient } from '@/lib/apiClient';

export const roomsApi = {
  list: (params) => apiClient.get('/rooms', { params }),
  getById: (id) => apiClient.get(`/rooms/${id}`),
  create: (data) => apiClient.post('/rooms', data),
  update: (id, data) => apiClient.patch(`/rooms/${id}`, data),
};

export const buildingsApi = {
  list: (hostelId) => apiClient.get('/buildings', { params: { hostelId } }),
  create: (data) => apiClient.post('/buildings', data),
  addFloor: (buildingId, data) => apiClient.post(`/buildings/${buildingId}/floors`, data),
};

export const bedsApi = {
  list: (roomId) => apiClient.get(`/rooms/${roomId}/beds`),
  create: (roomId, data) => apiClient.post(`/rooms/${roomId}/beds`, data),
  updateStatus: (roomId, bedId, status) =>
    apiClient.patch(`/rooms/${roomId}/beds/${bedId}/status`, { status }),
};