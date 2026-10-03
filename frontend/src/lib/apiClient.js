import axios from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useResidentAuthStore } from '@/store/residentAuthStore';

/**
 * Single axios instance used by every feature's API layer — including the
 * Resident Portal. withCredentials is required because both auth systems
 * use HttpOnly cookies rather than tokens in localStorage.
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
});

let isRefreshingStaff = false;
let staffPendingQueue = [];
let isRefreshingResident = false;
let residentPendingQueue = [];

function resolveQueue(queue, error) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  return [];
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
    const url = originalRequest?.url ?? '';
    // The ONLY thing that decides which auth system a failing request
    // belongs to — a resident's expired session must never attempt a
    // staff refresh, or vice versa.
    const isPortalRequest = url.includes('/portal/');
    const isAuthEndpoint = isPortalRequest
      ? url.includes('/portal/auth/login') || url.includes('/portal/auth/refresh')
      : url.includes('/auth/login') || url.includes('/auth/refresh');

    if (status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isPortalRequest) {
        if (isRefreshingResident) {
          return new Promise((resolve, reject) => {
            residentPendingQueue.push({ resolve, reject });
          }).then(() => apiClient(originalRequest));
        }
        isRefreshingResident = true;
        try {
          await apiClient.post('/portal/auth/refresh');
          residentPendingQueue = resolveQueue(residentPendingQueue, null);
          return apiClient(originalRequest);
        } catch (refreshError) {
          residentPendingQueue = resolveQueue(residentPendingQueue, refreshError);
          useResidentAuthStore.getState().clearResident();
          // if (
          //   typeof window !== 'undefined' &&
          //   !window.location.pathname.startsWith('/portal/login')
          // )
          // {
          //   window.location.assign('/portal/login');
          // }
          return Promise.reject(normalizeError(refreshError));
        } finally {
          isRefreshingResident = false;
        }
      }

      // Staff path — unchanged behavior from before this phase.
      if (isRefreshingStaff) {
        return new Promise((resolve, reject) => {
          staffPendingQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }
      isRefreshingStaff = true;
      try {
        await apiClient.post('/auth/refresh');
        staffPendingQueue = resolveQueue(staffPendingQueue, null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        staffPendingQueue = resolveQueue(staffPendingQueue, refreshError);
        useAuthStore.getState().clearUser();
        // if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        //   window.location.assign('/login');
        // }
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshingStaff = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);
