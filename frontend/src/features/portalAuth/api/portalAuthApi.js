import { apiClient } from '@/lib/apiClient';

export const portalAuthApi = {
  login: (credentials) => apiClient.post('/portal/auth/login', credentials),
  logout: () => apiClient.post('/portal/auth/logout'),
  me: () => apiClient.get('/portal/auth/me'),
  setupAccount: (data) => apiClient.post('/portal/auth/setup-account', data),
  requestPasswordReset: (email) => apiClient.post('/portal/auth/request-password-reset', { email }),
  resetPassword: (data) => apiClient.post('/portal/auth/reset-password', data),
};
