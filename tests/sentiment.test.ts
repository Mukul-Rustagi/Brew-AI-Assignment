import { describe, expect, it } from "vitest";
import { buildAudienceInsight, classifyReview } from "@/lib/sentiment";

describe("Sentiment classifier", () => {
  it("classifies positive review", () => {
    const result = classifyReview("Amazing performances, brilliant writing, excellent movie.");
    expect(result.label).toBe("positive");
    expect(result.score).toBeGreaterThan(0);
  });

  it("classifies negative review", () => {
    const result = classifyReview("Terrible pacing and weak story, very disappointing.");
    expect(result.label).toBe("negative");
    expect(result.score).toBeLessThan(0);
  });

  it("returns mixed for neutral review", () => {
    const result = classifyReview("The movie had good and bad moments.");
    expect(result.label).toBe("mixed");
  });
});

describe("Audience insight summary", () => {
  it("computes aggregate summary and totals", () => {
    const insight = buildAudienceInsight([
      "Excellent direction and amazing cast.",
      "Great visuals but slow pacing.",
      "Disappointing ending and weak script."
    ]);

    expect(insight.positiveCount + insight.mixedCount + insight.negativeCount).toBe(3);
    expect(["positive", "mixed", "negative"]).toContain(insight.overall);
    expect(insight.summary.length).toBeGreaterThan(20);
  });

  it("handles empty inputs safely", () => {
    const insight = buildAudienceInsight([]);
    expect(insight.overall).toBe("mixed");
    expect(insight.confidence).toBe(0);
  });
});
