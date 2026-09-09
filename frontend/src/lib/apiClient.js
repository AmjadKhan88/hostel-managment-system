import axios from 'axios';
import { config } from '@/config/env';

/**
 * Single axios instance used by every feature's API layer.
 * withCredentials is required because auth uses HttpOnly cookies rather
 * than tokens in localStorage (see MASTER PROJECT INSTRUCTIONS §16).
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
});

// A response interceptor for centralized 401 handling (redirect to login,
// silent refresh, etc.) is added on the Authentication day.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalized = {
      message: error.response?.data?.message || 'Something went wrong. Please try again.',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(normalized);
  }
);
