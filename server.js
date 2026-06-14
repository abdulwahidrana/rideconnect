/**
 * RideConnect custom server.
 * Runs Next.js and attaches a Socket.io server to the same HTTP server,
 * so API routes and sockets share one process. The io instance is stored
 * on `global._io` so REST API route handlers can emit real-time events.
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || "*" },
  });

  // Expose io to Next.js API routes (same process).
  global._io = io;

  // ---- Socket.io real-time dispatch layer ----
  io.on("connection", (socket) => {
    const { userId, role } = socket.handshake.query;

    if (userId) {
      // Private room per user for targeted updates.
      socket.join(`user:${userId}`);
    }
    if (role === "driver") {
      socket.join("drivers");
    }
    if (role === "admin") {
      socket.join("admins");
    }

    // Driver toggles availability — keeps them in/out of the dispatch pool.
    socket.on("driver:availability", ({ online }) => {
      if (online) socket.join("drivers:online");
      else socket.leave("drivers:online");
    });

    // Live location pings from a driver during an active ride.
    socket.on("ride:location", ({ rideId, passengerId, lat, lng }) => {
      if (rideId && passengerId) {
        io.to(`user:${passengerId}`).emit("ride:location", { rideId, lat, lng });
        io.to("admins").emit("ride:location", { rideId, lat, lng });
      }
    });

    socket.on("disconnect", () => {
      // Rooms are cleaned up automatically by Socket.io.
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> RideConnect ready on http://localhost:${port}`);
  });
});
