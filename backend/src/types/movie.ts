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
  releaseDate: string;
  runtime: string;
  genre: string;
  rating: string;
  plot: string;
  audienceInsight: MovieAudienceInsight;
  reviews: string[];
}

export interface OmdbResponse {
  Title?: string;
  Poster?: string;
  Actors?: string;
  Year?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  imdbRating?: string;
  Plot?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Response: "True" | "False";
  Error?: string;
}

export interface TmdbFindResponse {
  movie_results?: Array<{ id: number }>;
}

export interface TmdbReviewResponse {
  results?: Array<{ content?: string }>;
}
