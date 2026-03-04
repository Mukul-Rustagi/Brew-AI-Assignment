import express from "express";
import cors from "cors";
import { movieInsightsRouter } from "./routes/movie-insights.route";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "*"
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "ai-movie-insight-backend" });
  });

  app.use("/api", movieInsightsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  return app;
}
