"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, CalendarDays, Clapperboard, Film, Loader2, ScanSearch, Sparkles, Star, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import type { MovieInsightResponse, SentimentLabel } from "@/lib/types";
import { validateImdbId } from "@/lib/validation";

type ApiPayload = { data: MovieInsightResponse } | { error: string };

const sentimentMeta: Record<SentimentLabel, { label: string; className: string }> = {
  positive: { label: "Positive", className: "sentiment sentiment-positive" },
  mixed: { label: "Mixed", className: "sentiment sentiment-mixed" },
  negative: { label: "Negative", className: "sentiment sentiment-negative" }
};

export function MovieInsightBuilder() {
  const [imdbId, setImdbId] = useState("tt0133093");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MovieInsightResponse | null>(null);

  const normalized = useMemo(() => imdbId.trim().toLowerCase(), [imdbId]);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

  async function fetchInsights() {
    const valid = validateImdbId(normalized);
    if (!valid.ok) {
      setError(valid.error);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/movie-insights` : "/api/movie-insights";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imdbId: valid.imdbId })
      });

      const payload = (await res.json()) as ApiPayload;

      if (!res.ok || "error" in payload) {
        setData(null);
        setError(("error" in payload && payload.error) || "Unable to fetch movie insights.");
        return;
      }

      setData({
        ...payload.data,
        releaseDate: payload.data.releaseDate || "N/A",
        runtime: payload.data.runtime || "N/A",
        genre: payload.data.genre || "N/A"
      });
    } catch {
      setError("Network error while loading movie insights.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="noise" aria-hidden="true" />
      <motion.section
        className="hero-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="eyebrow">Brew Assignment</p>
        <h1>AI Movie Insight Builder</h1>
        <p className="subtext">
          Enter an IMDb ID and get movie metadata, audience review signals, AI-style sentiment summary, and overall
          classification.
        </p>

        <div className="search-row">
          <div className="input-wrap">
            <ScanSearch size={18} />
            <input
              value={imdbId}
              onChange={(event) => setImdbId(event.target.value)}
              placeholder="tt0133093"
              aria-label="IMDb ID"
            />
          </div>

          <button onClick={fetchInsights} disabled={loading} className="primary-btn" type="button">
            {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Generating" : "Analyze"}
          </button>
        </div>

        {error && (
          <div className="error-box" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </motion.section>

      {data && (
        <motion.section
          className="results-grid"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <article className="panel poster-panel">
            {data.poster ? (
              <Image src={data.poster} alt={`${data.title} poster`} width={480} height={720} className="poster" />
            ) : (
              <div className="poster-placeholder">
                <Clapperboard size={32} />
                <span>Poster unavailable</span>
              </div>
            )}
          </article>

          <article className="panel details-panel">
            <div className="title-row">
              <h2>{data.title}</h2>
              <span className={sentimentMeta[data.audienceInsight.overall].className}>
                {sentimentMeta[data.audienceInsight.overall].label}
              </span>
            </div>

            <div className="meta-row">
              <span>
                <Star size={14} /> IMDb {data.rating}
              </span>
              <span>{data.releaseYear}</span>
              <span>
                <CalendarDays size={14} /> {data.releaseDate}
              </span>
              <span>{data.imdbId}</span>
            </div>

            <p className="plot">{data.plot}</p>

            <div className="card-block">
              <h3>Metadata</h3>
              <div className="meta-detail-grid">
                <span>
                  <Timer size={14} /> Runtime: {data.runtime}
                </span>
                <span>
                  <Film size={14} /> Genre: {data.genre}
                </span>
              </div>
            </div>

            <div className="card-block">
              <h3>Cast</h3>
              <ul className="chip-list">
                {data.cast.length > 0 ? (
                  data.cast.map((actor) => <li key={actor}>{actor}</li>)
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>

            <div className="card-block">
              <h3>Audience Sentiment Insight</h3>
              <p>{data.audienceInsight.summary}</p>
              <div className="stats-row">
                <span>Confidence: {data.audienceInsight.confidence}%</span>
                <span>Positive: {data.audienceInsight.positiveCount}</span>
                <span>Mixed: {data.audienceInsight.mixedCount}</span>
                <span>Negative: {data.audienceInsight.negativeCount}</span>
              </div>
              {data.audienceInsight.topThemes.length > 0 && (
                <div className="theme-row">
                  {data.audienceInsight.topThemes.map((theme) => (
                    <span key={theme} className="theme-pill">
                      #{theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>

          <article className="panel reviews-panel">
            <h3>Audience Comments Sample</h3>
            <ul>
              {data.reviews.map((review, index) => (
                <li key={`${index}-${review.slice(0, 16)}`}>{review}</li>
              ))}
            </ul>
          </article>
        </motion.section>
      )}
    </main>
  );
}
