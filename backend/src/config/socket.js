import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens.js';
import { env } from './env.js';
import { logger } from './logger.js';
import { setSocketServer } from '../events/socketEvents.js';

/**
 * Socket.IO's handshake doesn't go through Express's cookie-parser
 * middleware, so the accessToken cookie is pulled out of the raw header
 * manually here — same JWT the REST API trusts either way.
 */
function extractAccessToken(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = extractAccessToken(socket.handshake.headers.cookie);
      if (!token) return next(new Error('Authentication required'));

      socket.user = verifyAccessToken(token); // { id, hostelId, roleId, permissions }
      next();
    } catch {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    const hostelId = socket.user.hostelId;
    if (hostelId) {
      socket.join(`hostel:${hostelId}`);
    }
    // Super Admin (hostelId: null) doesn't auto-join a room — they'd need
    // to explicitly pick a hostel, same as the REST API requires a
    // hostelId param. Not wired up on the client yet; fine to add later.

    logger.info({ userId: socket.user.id, hostelId }, 'Socket connected');

    socket.on('disconnect', () => {
      logger.info({ userId: socket.user.id }, 'Socket disconnected');
    });
  });

  setSocketServer(io);
  return io;
}