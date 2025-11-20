import path from "node:path";
import next from "next";
import { loadEnv } from "@resume-analyzer/config";
import { createApp } from "./app";

const env = loadEnv();
const app = createApp(env);

const port = Number(env.API_PORT ?? env.PORT ?? 4000);
const shouldServeFrontend =
  process.env.SERVE_FRONTEND_FROM_API === "true" ||
  env.NODE_ENV === "production";

async function boot() {
  if (shouldServeFrontend) {
    const dev = env.NODE_ENV !== "production";
    const webAppDir = path.resolve(__dirname, "../../web");
    const nextApp = next({ dev, dir: webAppDir });
    const handle = nextApp.getRequestHandler();
    await nextApp.prepare();
    app.all("*", (req, res) => handle(req, res));
    console.log(`🖥️  Serving Next.js frontend from ${webAppDir}`);
  }

  app.listen(port, () => {
    console.log(`🔌 Resume API listening on http://localhost:${port}`);
  });
}

boot().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
