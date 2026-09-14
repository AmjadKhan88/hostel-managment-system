let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

/**
 * Broadcasts an event to everyone connected and scoped to a hostel.
 * Services import this rather than needing the io instance threaded
 * through every function signature.
 */
export function emitToHostel(hostelId, event, payload) {
  if (!ioInstance || !hostelId) return;
  ioInstance.to(`hostel:${hostelId}`).emit(event, payload);
}