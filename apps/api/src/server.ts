import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { loadEnv } from "@resume-analyzer/config";
import matchRouter from "./routes/match-router";
import resumeRouter from "./routes/resume-router";
import { buildRequestLogger } from "./utils/logger";

const env = loadEnv();

const app = express();
app.use(cors({ origin: env.CLIENT_ORIGIN ?? "*", credentials: true }));
app.use(express.json({ limit: "15mb" }));
app.use(buildRequestLogger());

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    service: "resume-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/uploads", resumeRouter);
app.use("/api/matches", matchRouter);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unexpected error", error);
  res.status(500).json({ message: error.message ?? "Unexpected error" });
});

const port = Number(env.API_PORT ?? env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`🔌 Resume API listening on http://localhost:${port}`);
});
