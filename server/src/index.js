import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.1.35:5173" // <-- CHANGE to your LAN IP
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, pid: process.pid, time: Date.now() });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

function safeRoom(code) {
  return String(code || "").trim().toUpperCase();
}

// in-memory room state
// roomCode => Map(socketId => { socketId, name })
const rooms = new Map();

function getParticipants(roomCode) {
  const m = rooms.get(roomCode);
  if (!m) return [];
  return Array.from(m.values());
}

io.on("connection", (socket) => {
  // join room
  socket.on("room:join", ({ roomCode, name }, ack) => {
    const code = safeRoom(roomCode);
    const userName = String(name || "Guest").trim().slice(0, 40) || "Guest";

    socket.data.roomCode = code;
    socket.data.name = userName;

    if (!rooms.has(code)) rooms.set(code, new Map());
    rooms.get(code).set(socket.id, { socketId: socket.id, name: userName });

    socket.join(code);

    // ack to caller with current participants
    ack?.({
      ok: true,
      me: { socketId: socket.id, name: userName },
      participants: getParticipants(code),
    });

    // notify room
    socket.to(code).emit("room:user-joined", {
      user: { socketId: socket.id, name: userName },
    });

    io.to(code).emit("room:participants", { participants: getParticipants(code) });
  });

  // chat
  socket.on("chat:send", ({ roomCode, message }) => {
    const code = safeRoom(roomCode || socket.data.roomCode);
    const text = String(message || "").trim();
    if (!text) return;

    io.to(code).emit("chat:message", {
      id: cryptoRandomId(),
      ts: Date.now(),
      from: { socketId: socket.id, name: socket.data.name || "Guest" },
      text,
    });
  });

  // signaling relays
  socket.on("webrtc:offer", ({ to, offer }) => {
    io.to(to).emit("webrtc:offer", { from: socket.id, offer });
  });

  socket.on("webrtc:answer", ({ to, answer }) => {
    io.to(to).emit("webrtc:answer", { from: socket.id, answer });
  });

  socket.on("webrtc:ice", ({ to, candidate }) => {
    io.to(to).emit("webrtc:ice", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    if (!code) return;

    const m = rooms.get(code);
    if (m) {
      m.delete(socket.id);
      if (m.size === 0) rooms.delete(code);
    }

    socket.to(code).emit("room:user-left", { socketId: socket.id });
    io.to(code).emit("room:participants", { participants: getParticipants(code) });
  });
});

function cryptoRandomId() {
  // small unique id (no external deps)
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const PORT = Number(process.env.PORT || 5000);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend listening on http://0.0.0.0:${PORT}`);
  console.log("✅ Allowed origins:", allowedOrigins);
});
