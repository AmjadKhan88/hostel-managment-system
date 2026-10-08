import { io } from 'socket.io-client';
import { config } from '@/config/env';
import { apiClient } from '@/lib/apiClient';

const REFRESH_COOLDOWN_MS = 30_000;

/**
 * `role` tells the server which cookie to authenticate this connection
 * with — staff and resident sessions can both exist in one browser.
 *
 * A rejection by the server's auth middleware (e.g. the 15-minute access
 * token expired) is NOT retried by socket.io on its own. Without the
 * handler below, live updates would silently stop after 15 minutes. It
 * refreshes the session and reconnects, at most once per cooldown so a
 * truly dead session can't loop.
 */
function createSocket({ role, refreshPath }) {
  const socket = io(config.socketUrl, {
    withCredentials: true,
    autoConnect: false,
    auth: { role },
  });

  let lastRefreshAt = 0;
  socket.on('connect_error', async (err) => {
    if (!/expired|authentication/i.test(err.message)) return;
    if (Date.now() - lastRefreshAt < REFRESH_COOLDOWN_MS) return;
    lastRefreshAt = Date.now();
    try {
      await apiClient.post(refreshPath);
      socket.connect();
    } catch {
      // Session is gone — the next REST call sends the user to login.
    }
  });

  return socket;
}

let staffSocket = null;
let residentSocket = null;

export function getSocket() {
  if (!staffSocket) staffSocket = createSocket({ role: 'staff', refreshPath: '/auth/refresh' });
  return staffSocket;
}

export function getResidentSocket() {
  if (!residentSocket)
    residentSocket = createSocket({ role: 'resident', refreshPath: '/portal/auth/refresh' });
  return residentSocket;
}
