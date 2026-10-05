import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const MAX_PLAYERS = 10;

// Lightweight HTTP server for Render health checks and status monitoring
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(
    JSON.stringify({
      status: "online",
      service: "Naufal Metaverse Multiplayer Relay",
      onlinePlayers: wss.clients.size,
      maxPlayers: MAX_PLAYERS,
    })
  );
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;

  // Strict Max 10 Players per room for peak 60 FPS performance
  if (wss.clients.size > MAX_PLAYERS) {
    console.log(`[Multiplayer] Room full (${wss.clients.size}/${MAX_PLAYERS}). Rejected: ${ip}`);
    ws.send(JSON.stringify({ type: "room_full", max: MAX_PLAYERS }));
    ws.close(1008, "Room full (Max 10 players)");
    return;
  }

  console.log(`[Multiplayer] Client connected from ${ip}. Online: ${wss.clients.size}/${MAX_PLAYERS}`);

  ws.on("message", (raw) => {
    // Broadcast message to all OTHER connected clients
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    }
  });

  ws.on("close", () => {
    console.log(`[Multiplayer] Client disconnected. Online: ${wss.clients.size}/${MAX_PLAYERS}`);
  });

  ws.on("error", (err) => {
    console.warn(`[Multiplayer] Socket error:`, err.message);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Multiplayer] HTTP & WebSocket server listening on port ${PORT} (Max Players: ${MAX_PLAYERS})...`);
});

process.on("SIGINT", () => {
  console.log("[Multiplayer] Shutting down WebSocket server...");
  wss.close();
  server.close();
  process.exit(0);
});
