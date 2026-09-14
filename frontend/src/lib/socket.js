import { io } from 'socket.io-client';
import { config } from '@/config/env';

let socket = null;

/**
 * Lazily creates a single shared socket connection. Auth relies on the
 * accessToken HttpOnly cookie already being set from login — the browser
 * attaches it automatically since withCredentials is set, mirroring how
 * apiClient authenticates over plain HTTP.
 */
export function getSocket() {
  if (!socket) {
    socket = io(config.socketUrl, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}