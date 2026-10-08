let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

/**
 * Broadcasts to STAFF connected to a hostel. Residents never join this
 * room — its events carry other residents' names and amounts.
 */
export function emitToHostel(hostelId, event, payload) {
  if (!ioInstance || !hostelId) return;
  ioInstance.to(`hostel:${hostelId}`).emit(event, payload);
}

/** Targets ONE resident's own connections (every tab/device they have open). */
export function emitToResident(residentId, event, payload) {
  if (!ioInstance || !residentId) return;
  ioInstance.to(`resident:${residentId.toString()}`).emit(event, payload);
}

/** Broadcasts to every connected resident of a hostel (e.g. a new notice). */
export function emitToHostelResidents(hostelId, event, payload) {
  if (!ioInstance || !hostelId) return;
  ioInstance.to(`hostel-residents:${hostelId.toString()}`).emit(event, payload);
}
