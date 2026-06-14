import type { Server } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var _io: Server | undefined;
}

/** Returns the Socket.io server attached in server.js (same process). */
export function getIO(): Server | null {
  return global._io ?? null;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  getIO()?.to(`user:${userId}`).emit(event, payload);
}

export function emitToOnlineDrivers(event: string, payload: unknown) {
  getIO()?.to("drivers:online").emit(event, payload);
}

export function emitToAdmins(event: string, payload: unknown) {
  getIO()?.to("admins").emit(event, payload);
}
