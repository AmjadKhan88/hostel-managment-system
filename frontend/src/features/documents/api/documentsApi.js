import { apiClient } from '@/lib/apiClient';

export const documentsApi = {
  list: (residentId) => apiClient.get(`/residents/${residentId}/documents`),
  // FormData is passed as-is — axios sets the correct multipart boundary
  // automatically as long as we don't manually set a Content-Type header.
  upload: (residentId, formData) => apiClient.post(`/residents/${residentId}/documents`, formData),
  remove: (residentId, id) => apiClient.delete(`/residents/${residentId}/documents/${id}`),
};