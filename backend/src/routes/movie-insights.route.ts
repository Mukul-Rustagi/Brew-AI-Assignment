import { Router } from "express";
import { validateImdbId } from "../utils/validation";
import { getMovieInsights } from "../services/movie.service";

export const movieInsightsRouter = Router();

movieInsightsRouter.post("/movie-insights", async (req, res) => {
  try {
    const validation = validateImdbId(req.body?.imdbId ?? "");

    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const data = await getMovieInsights(validation.imdbId);
    return res.status(200).json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const statusCode = message.includes("Missing required environment variable") ? 500 : 400;
    return res.status(statusCode).json({ error: message });
  }
});
