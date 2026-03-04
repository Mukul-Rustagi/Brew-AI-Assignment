import type { MovieAudienceInsight, SentimentLabel } from "@/lib/types";

const POSITIVE_WORDS = new Set([
  "amazing",
  "excellent",
  "great",
  "masterpiece",
  "beautiful",
  "brilliant",
  "fantastic",
  "love",
  "loved",
  "favorite",
  "perfect",
  "outstanding",
  "enjoyed",
  "powerful",
  "strong",
  "impressive"
]);

const NEGATIVE_WORDS = new Set([
  "boring",
  "bad",
  "terrible",
  "weak",
  "waste",
  "worst",
  "slow",
  "predictable",
  "mess",
  "disappointing",
  "confusing",
  "flat",
  "overrated",
  "underwhelming",
  "poor"
]);

const STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "this",
  "that",
  "movie",
  "film",
  "was",
  "are",
  "for",
  "you",
  "its",
  "from",
  "have",
  "has",
  "very",
  "but",
  "just",
  "they",
  "them",
  "about"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function classifyReview(text: string): { label: SentimentLabel; score: number } {
  const tokens = tokenize(text);
  let score = 0;

  for (const token of tokens) {
    if (POSITIVE_WORDS.has(token)) score += 1;
    if (NEGATIVE_WORDS.has(token)) score -= 1;
  }

  if (score >= 2) return { label: "positive", score };
  if (score <= -2) return { label: "negative", score };
  return { label: "mixed", score };
}

function topThemesFromReviews(reviews: string[], limit = 4): string[] {
  const counts = new Map<string, number>();

  for (const review of reviews) {
    for (const token of tokenize(review)) {
      if (token.length < 4 || STOPWORDS.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}

export function buildAudienceInsight(reviews: string[]): MovieAudienceInsight {
  const safeReviews = reviews.filter((r) => r.trim().length > 0).slice(0, 20);

  if (safeReviews.length === 0) {
    return {
      summary:
        "Not enough public review text was available from configured providers. Add TMDB token for richer sentiment extraction.",
      overall: "mixed",
      confidence: 0,
      positiveCount: 0,
      mixedCount: 0,
      negativeCount: 0,
      topThemes: []
    };
  }

  let positiveCount = 0;
  let mixedCount = 0;
  let negativeCount = 0;

  for (const review of safeReviews) {
    const result = classifyReview(review);
    if (result.label === "positive") positiveCount += 1;
    if (result.label === "mixed") mixedCount += 1;
    if (result.label === "negative") negativeCount += 1;
  }

  const total = safeReviews.length;
  const maxBucket = Math.max(positiveCount, mixedCount, negativeCount);
  const confidence = Number(((maxBucket / total) * 100).toFixed(1));

  let overall: SentimentLabel = "mixed";
  if (positiveCount > negativeCount && positiveCount >= mixedCount) overall = "positive";
  if (negativeCount > positiveCount && negativeCount >= mixedCount) overall = "negative";

  const themes = topThemesFromReviews(safeReviews);

  const summaryParts = [
    `Analyzed ${total} audience comments.`,
    `${positiveCount} positive, ${mixedCount} mixed, ${negativeCount} negative.`,
    overall === "positive"
      ? "Audience reaction is largely favorable with recurring appreciation for performances and execution."
      : overall === "negative"
        ? "Audience feedback trends critical, mainly around pacing, narrative coherence, or expectations mismatch."
        : "Audience is divided: many users appreciated parts of the film, while others raised clear concerns."
  ];

  if (themes.length > 0) {
    summaryParts.push(`Top recurring themes: ${themes.join(", ")}.`);
  }

  return {
    summary: summaryParts.join(" "),
    overall,
    confidence,
    positiveCount,
    mixedCount,
    negativeCount,
    topThemes: themes
  };
}
