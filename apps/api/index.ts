import fs from "node:fs";
import path from "node:path";
import express from "express";
import { loadEnv } from "@resume-analyzer/config";
import { createApp } from "./src/app";

const env = loadEnv();
const app = createApp(env);

// In production/Vercel, serve Next.js from the same Express app
const shouldServeFrontend =
  process.env.SERVE_FRONTEND_FROM_API === "true" ||
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1";

if (shouldServeFrontend) {
  const frontendDir = resolveFrontendDir();
  if (frontendDir) {
    app.use(express.static(frontendDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDir, "index.html"));
    });
  } else {
    console.warn("⚠️ Frontend build not found for serverless function.");
  }
}

function resolveFrontendDir() {
  const candidates = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "apps/api/public"),
    path.resolve(process.cwd(), "public"),
  ];
  return candidates.find((dir) => fs.existsSync(dir));
}

export default app;
