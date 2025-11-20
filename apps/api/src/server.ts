import fs from "node:fs";
import path from "node:path";
import express from "express";
import { loadEnv } from "@resume-analyzer/config";
import { createApp } from "./app";

const env = loadEnv();
const app = createApp(env);

const port = Number(env.API_PORT ?? env.PORT ?? 4000);
const shouldServeFrontend =
  process.env.SERVE_FRONTEND_FROM_API === "true" ||
  env.NODE_ENV === "production";
const frontendDir = resolveFrontendDir();

function resolveFrontendDir() {
  const candidates = [
    path.resolve(__dirname, "../public"),
    path.resolve(process.cwd(), "apps/api/public"),
    path.resolve(process.cwd(), "public"),
  ];
  return candidates.find((dir) => fs.existsSync(dir));
}

if (shouldServeFrontend) {
  if (frontendDir) {
    app.use(express.static(frontendDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDir, "index.html"));
    });
    console.log(`🖥️  Serving static frontend from ${frontendDir}`);
  } else {
    console.warn("⚠️ Frontend build not found. Static assets will not be served.");
  }
}

app.listen(port, () => {
  console.log(`🔌 Resume API listening on http://localhost:${port}`);
});
