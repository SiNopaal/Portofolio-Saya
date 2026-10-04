import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverScript = path.resolve(__dirname, "server.mjs");

function startServer() {
  console.log(`[Watchdog] Launching Next.js production server...`);
  const child = spawn("node", [serverScript], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    console.warn(`[Watchdog] Server exited (code ${code}, signal ${signal}). Auto-restarting in 1 second...`);
    setTimeout(startServer, 1000);
  });

  child.on("error", (err) => {
    console.error(`[Watchdog] Error spawning server:`, err);
    setTimeout(startServer, 2000);
  });
}

startServer();

// Permanent watchdog heartbeat to keep parent runner active
setInterval(() => {
  console.log(`[Watchdog Heartbeat] Node supervisor alive | ${new Date().toLocaleTimeString()}`);
}, 40000);
