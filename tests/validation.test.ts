import { describe, expect, it } from "vitest";
import { normalizeImdbId, validateImdbId } from "@/lib/validation";

describe("IMDb validation", () => {
  it("normalizes and validates a proper IMDb ID", () => {
    const result = validateImdbId(" TT0133093 ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.imdbId).toBe("tt0133093");
    }
  });

  it("rejects malformed IDs", () => {
    const result = validateImdbId("matrix");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("IMDb ID");
    }
  });

  it("normalizes values to lowercase and trim", () => {
    expect(normalizeImdbId(" TT1234567 ")).toBe("tt1234567");
  });
});
