import { maybeRefineInsightWithLlm } from "./ai-summary.service";
import { buildAudienceInsight } from "./sentiment.service";
import type { MovieInsightResponse, OmdbResponse, TmdbFindResponse, TmdbReviewResponse } from "../types/movie";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function fetchOmdbMovie(imdbId: string): Promise<OmdbResponse> {
  const key = requireEnv("OMDB_API_KEY");
  const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&i=${encodeURIComponent(imdbId)}&plot=short`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch movie details from OMDb.");
  }

  const payload = (await res.json()) as OmdbResponse;
  if (payload.Response !== "True") {
    throw new Error(payload.Error ?? "OMDb could not find this IMDb ID.");
  }

  return payload;
}

async function fetchTmdbReviews(imdbId: string): Promise<string[]> {
  const token = process.env.TMDB_API_READ_TOKEN;
  if (!token) {
    return [];
  }

  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json;charset=utf-8"
  };

  const findRes = await fetch(
    `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?external_source=imdb_id`,
    { headers: commonHeaders }
  );

  if (!findRes.ok) return [];

  const findPayload = (await findRes.json()) as TmdbFindResponse;
  const movieId = findPayload.movie_results?.[0]?.id;
  if (!movieId) return [];

  const reviewsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?language=en-US&page=1`, {
    headers: commonHeaders
  });

  if (!reviewsRes.ok) return [];

  const reviewsPayload = (await reviewsRes.json()) as TmdbReviewResponse;
  return (reviewsPayload.results ?? [])
    .map((item) => (item.content ?? "").trim())
    .filter(Boolean)
    .slice(0, 20);
}

function fallbackReviewSnippets(movie: OmdbResponse): string[] {
  const snippets: string[] = [];

  if (movie.Plot && movie.Plot !== "N/A") {
    snippets.push(`Viewers frequently discuss the story arc: ${movie.Plot}`);
  }

  for (const rating of movie.Ratings ?? []) {
    snippets.push(`${rating.Source} audience sentiment signal: ${rating.Value}`);
  }

  if (snippets.length === 0) {
    snippets.push("Audience comments are limited for this title.");
  }

  return snippets;
}

export async function getMovieInsights(imdbId: string): Promise<MovieInsightResponse> {
  const movie = await fetchOmdbMovie(imdbId);
  const liveReviews = await fetchTmdbReviews(imdbId);
  const reviews = liveReviews.length > 0 ? liveReviews : fallbackReviewSnippets(movie);

  const baseInsight = buildAudienceInsight(reviews);
  const audienceInsight = await maybeRefineInsightWithLlm(reviews, baseInsight);

  return {
    imdbId,
    title: movie.Title ?? "Unknown Title",
    poster: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "",
    cast: (movie.Actors ?? "")
      .split(",")
      .map((actor) => actor.trim())
      .filter(Boolean),
    releaseYear: movie.Year ?? "N/A",
    rating: movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "N/A",
    plot: movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "Plot not available.",
    audienceInsight,
    reviews
  };
}
