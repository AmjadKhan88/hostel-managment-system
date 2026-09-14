import { apiClient } from '@/lib/apiClient';

export const settingsApi = {
  getHostel: (hostelId) => apiClient.get(`/hostels/${hostelId}`),
  updateHostel: (hostelId, data) => apiClient.patch(`/hostels/${hostelId}`, data),
  uploadLogo: (hostelId, formData) => apiClient.post(`/hostels/${hostelId}/logo`, formData),
};