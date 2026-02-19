// server/signaling.js
import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;

const server = http.createServer();
const wss = new WebSocketServer({ server });

/**
 * rooms: Map<roomId, Map<clientId, ws>>
 */
const rooms = new Map();

function safeSend(ws, msg) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

wss.on("connection", (ws) => {
  let roomId = null;
  let clientId = null;

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (data.type === "join") {
      roomId = String(data.roomId || "");
      clientId = String(data.clientId || "");
      if (!roomId || !clientId) return;

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const room = rooms.get(roomId);

      // Send existing peers to the new joiner
      const existing = Array.from(room.keys());
      safeSend(ws, { type: "peers", peers: existing });

      // Notify existing peers about new peer
      for (const [peerId, peerWs] of room.entries()) {
        safeSend(peerWs, { type: "peer-joined", peerId: clientId });
      }

      room.set(clientId, ws);
      return;
    }

    // Relay signaling messages
    if (data.type === "signal") {
      const to = String(data.to || "");
      const payload = data.payload;

      if (!roomId || !clientId || !to) return;
      const room = rooms.get(roomId);
      if (!room) return;

      const target = room.get(to);
      if (!target) return;

      safeSend(target, {
        type: "signal",
        from: clientId,
        payload,
      });
    }
  });

  ws.on("close", () => {
    if (!roomId || !clientId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(clientId);

    // Notify others
    for (const peerWs of room.values()) {
      safeSend(peerWs, { type: "peer-left", peerId: clientId });
    }

    if (room.size === 0) rooms.delete(roomId);
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on ws://localhost:${PORT}`);
});
