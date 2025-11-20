import path from "node:path";
import next from "next";
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
  const dev = false; // Always production mode in serverless
  const webAppDir = path.resolve(__dirname, "../web");
  const nextApp = next({ dev, dir: webAppDir });
  const handle = nextApp.getRequestHandler();

  // Prepare Next.js (async initialization)
  nextApp.prepare().then(() => {
    // Catch-all route for Next.js
    app.all("*", (req, res) => handle(req, res));
  });
}

export default app;
