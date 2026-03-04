import type { MovieAudienceInsight, SentimentLabel } from "../types/movie";

interface LlmPayload {
  summary: string;
  overall: SentimentLabel;
}

function isSentimentLabel(value: unknown): value is SentimentLabel {
  return value === "positive" || value === "mixed" || value === "negative";
}

function parseLlmPayload(raw: string): LlmPayload | null {
  try {
    const parsed = JSON.parse(raw) as { summary?: unknown; overall?: unknown };
    if (typeof parsed.summary !== "string" || parsed.summary.trim().length === 0) return null;
    if (!isSentimentLabel(parsed.overall)) return null;

    return {
      summary: parsed.summary.trim(),
      overall: parsed.overall
    };
  } catch {
    return null;
  }
}

export async function maybeRefineInsightWithLlm(
  reviews: string[],
  currentInsight: MovieAudienceInsight
): Promise<MovieAudienceInsight> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || reviews.length === 0) {
    return currentInsight;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const prompt = {
    reviews: reviews.slice(0, 12),
    currentInsight
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a movie sentiment analyst. Return JSON with keys: summary (<=60 words) and overall (positive|mixed|negative)."
          },
          {
            role: "user",
            content: `Use these audience signals and return concise insight JSON: ${JSON.stringify(prompt)}`
          }
        ]
      })
    });

    if (!response.ok) {
      return currentInsight;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) return currentInsight;

    const parsed = parseLlmPayload(content);
    if (!parsed) return currentInsight;

    return {
      ...currentInsight,
      summary: parsed.summary,
      overall: parsed.overall
    };
  } catch {
    return currentInsight;
  }
}
