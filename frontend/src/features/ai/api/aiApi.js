import { apiClient } from '@/lib/apiClient';

export const aiApi = {
  ask: (hostelId, question) =>
    apiClient.post('/ai-assistant/ask', { hostelId, question }, { timeout: 60_000 }),
  history: (hostelId) => apiClient.get('/ai-assistant/history', { params: { hostelId } }),
  generateNoticeDraft: (hostelId, type, prompt) =>
    apiClient.post('/ai-assistant/notice-draft', { hostelId, type, prompt }, { timeout: 60_000 }),
  triageComplaint: (hostelId, description) =>
    apiClient.post(
      '/ai-assistant/triage-complaint',
      { hostelId, description },
      { timeout: 60_000 }
    ),
};
