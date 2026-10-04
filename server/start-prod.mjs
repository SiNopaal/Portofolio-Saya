import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "start", "-p", "3000"], {
  cwd: root,
  stdio: ["ignore", "inherit", "inherit"],
  env: process.env,
});

child.on("exit", (code) => {
  console.log(`[Next.js Server] exited with code ${code}`);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
