import axios from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

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

let isRefreshing = false;
let pendingQueue = [];

function resolvePendingQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

function normalizeError(error) {
  return {
    message: error.response?.data?.message || 'Something went wrong. Please try again.',
    code: error.response?.data?.code || 'UNKNOWN_ERROR',
    status: error.response?.status,
    errors: error.response?.data?.errors || [],
  };
}

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    // On a 401 from a protected endpoint, try one silent refresh, then retry
    // the original request. Concurrent 401s share a single refresh call.
    if (status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      isRefreshing = true;
      try {
        await apiClient.post('/auth/refresh');
        resolvePendingQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        resolvePendingQueue(refreshError);
        useAuthStore.getState().clearUser();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);