import { apiClient } from '@/lib/apiClient';

export const aiApi = {
  ask: (hostelId, question) => apiClient.post('/ai-assistant/ask', { hostelId, question }),
  history: (hostelId) => apiClient.get('/ai-assistant/history', { params: { hostelId } }),
};
