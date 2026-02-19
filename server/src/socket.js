import { normalizeCode, ensureMeeting } from "./rooms.js";

// roomCode -> Map(socketId -> { socketId, name })
const roomUsers = new Map();

function getRoomMap(code) {
  const c = normalizeCode(code);
  if (!roomUsers.has(c)) roomUsers.set(c, new Map());
  return roomUsers.get(c);
}

function participants(code) {
  const c = normalizeCode(code);
  const m = roomUsers.get(c);
  return m ? [...m.values()] : [];
}

export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ CONNECT", socket.id, "origin:", socket.handshake.headers.origin);

    socket.on("room:join", async ({ roomCode, name }, ack) => {
      const code = normalizeCode(roomCode);
      if (!code) return ack?.({ ok: false, error: "Missing roomCode" });

      ensureMeeting(code);

      // leave previous room if any
      if (socket.data.roomCode && socket.data.roomCode !== code) {
        socket.leave(socket.data.roomCode);
        const prev = getRoomMap(socket.data.roomCode);
        prev.delete(socket.id);
        socket.to(socket.data.roomCode).emit("room:user-left", { socketId: socket.id });
      }

      socket.data.roomCode = code;
      socket.data.name = String(name || "Guest").trim() || "Guest";
      await socket.join(code);

      const rm = getRoomMap(code);
      rm.set(socket.id, { socketId: socket.id, name: socket.data.name });

      // send participant list to everyone
      io.to(code).emit("room:participants", { participants: participants(code) });

      // notify join
      socket.to(code).emit("room:user-joined", {
        user: { socketId: socket.id, name: socket.data.name },
      });

      ack?.({
        ok: true,
        roomCode: code,
        me: { socketId: socket.id, name: socket.data.name },
        participants: participants(code),
      });

      console.log("JOIN", code, socket.id, socket.data.name, "COUNT", rm.size);
    });

    // Signaling relay
    socket.on("webrtc:offer", ({ to, offer }) => {
      if (!to || !offer) return;
      io.to(to).emit("webrtc:offer", { from: socket.id, offer });
    });

    socket.on("webrtc:answer", ({ to, answer }) => {
      if (!to || !answer) return;
      io.to(to).emit("webrtc:answer", { from: socket.id, answer });
    });

    socket.on("webrtc:ice", ({ to, candidate }) => {
      if (!to || !candidate) return;
      io.to(to).emit("webrtc:ice", { from: socket.id, candidate });
    });

    socket.on("disconnect", () => {
      const code = socket.data.roomCode;
      if (!code) return;

      const rm = getRoomMap(code);
      rm.delete(socket.id);

      socket.to(code).emit("room:user-left", { socketId: socket.id });

      if (rm.size === 0) roomUsers.delete(code);

      io.to(code).emit("room:participants", { participants: participants(code) });
      console.log("👋 DISCONNECT", socket.id, "room:", code);
    });
  });
}
