import { loadEnv } from "@resume-analyzer/config";
import { createApp } from "./app";

const env = loadEnv();
const app = createApp(env);

const port = Number(env.API_PORT ?? env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`🔌 Resume API listening on http://localhost:${port}`);
});
