process.env.NODE_ENV = "production";

import fs from "node:fs";
import { createServer } from "node:http";
import next from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

process.exit = function(code) {
  const stack = new Error().stack;
  try {
    fs.appendFileSync(
      path.resolve(root, "server-exit.log"),
      `[${new Date().toISOString()}] Intercepted process.exit(${code}):\n${stack}\n\n`
    );
  } catch (e) {}
  console.warn(`[Server] Intercepted process.exit(${code}) - keeping server running!`);
};

try {
  process.loadEnvFile(path.resolve(root, ".env.local"));
} catch (e) {
  // Ignore if file doesn't exist
}

const app = next({ dev: false, dir: root });
const handle = app.getRequestHandler();

await app.prepare();

process.stdout.on("error", (err) => {
  if (err.code === "EPIPE") return;
});

process.stderr.on("error", (err) => {
  if (err.code === "EPIPE") return;
});

const server = createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error("Request handle error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });
});

server.on("error", (err) => {
  console.error("Server error:", err);
  if (err.code === "EADDRINUSE") {
    console.log("Port 3000 in use, retrying in 2 seconds...");
    setTimeout(() => {
      server.close();
      server.listen(3000);
    }, 2000);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("exit", (code) => {
  console.log("Process exit event triggered with code:", code);
});

process.on("beforeExit", (code) => {
  console.log("beforeExit triggered with code:", code);
});

// Ignore terminal disconnect breaks to keep background daemon permanently up
process.on("SIGINT", () => {
  console.log("SIGINT received, keeping daemon alive.");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, keeping daemon alive.");
});

const PORT = process.env.PORT || 3000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

server.listen(PORT, () => {
  console.log(`✓ Stable Next.js Production Server listening on http://localhost:${PORT}`);
});

// Keep event loop permanently active and prevent runner idle timeout
setInterval(() => {
  const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  console.log(`[Next.js Server] Uptime: ${Math.round(process.uptime())}s | Memory: ${mem}MB`);
}, 45000);

try {
  process.stdin.resume();
} catch (e) {}
