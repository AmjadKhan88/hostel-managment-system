import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens.js';
import { verifyResidentAccessToken } from '../utils/residentTokens.js';
import { env } from './env.js';
import { logger } from './logger.js';
import { setSocketServer } from '../events/socketEvents.js';

/**
 * Socket.IO's handshake doesn't go through Express's cookie-parser, so
 * cookies are pulled from the raw header. The name is anchored so
 * "accessToken" never matches inside "residentAccessToken".
 */
function extractCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
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
    // The CLIENT says which session it is connecting as. Without this, a
    // browser holding both a staff and a resident cookie would always be
    // authenticated as staff, even in the portal tab.
    const role = socket.handshake.auth?.role === 'resident' ? 'resident' : 'staff';
    const cookieHeader = socket.handshake.headers.cookie;

    try {
      if (role === 'resident') {
        const token = extractCookie(cookieHeader, 'residentAccessToken');
        if (!token) return next(new Error('Authentication required'));
        socket.resident = verifyResidentAccessToken(token); // { id, hostelId, tokenVersion }
      } else {
        const token = extractCookie(cookieHeader, 'accessToken');
        if (!token) return next(new Error('Authentication required'));
        socket.user = verifyAccessToken(token); // { id, hostelId, roleId, permissions }
      }
      socket.role = role;
      return next();
    } catch {
      return next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.role === 'resident') {
      const { id, hostelId } = socket.resident;
      // NEVER the staff `hostel:` room.
      socket.join(`resident:${id}`);
      socket.join(`hostel-residents:${hostelId}`);
      logger.info({ residentId: id, hostelId }, 'Resident socket connected');
      socket.on('disconnect', () =>
        logger.info({ residentId: id }, 'Resident socket disconnected')
      );
      return;
    }

    const hostelId = socket.user.hostelId;
    if (hostelId) socket.join(`hostel:${hostelId}`);
    // Super Admin (hostelId: null) doesn't auto-join a room — unchanged.

    logger.info({ userId: socket.user.id, hostelId }, 'Socket connected');
    socket.on('disconnect', () => logger.info({ userId: socket.user.id }, 'Socket disconnected'));
  });

  setSocketServer(io);
  return io;
}
