export type SentimentLabel = "positive" | "mixed" | "negative";

export interface MovieAudienceInsight {
  summary: string;
  overall: SentimentLabel;
  confidence: number;
  positiveCount: number;
  mixedCount: number;
  negativeCount: number;
  topThemes: string[];
}

export interface MovieInsightResponse {
  imdbId: string;
  title: string;
  poster: string;
  cast: string[];
  releaseYear: string;
  rating: string;
  plot: string;
  audienceInsight: MovieAudienceInsight;
  reviews: string[];
}
