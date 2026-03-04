import { z } from "zod";

const imdbIdSchema = z
  .string()
  .trim()
  .regex(/^tt\d{7,9}$/i, "IMDb ID must look like tt0133093");

export const movieRequestSchema = z.object({
  imdbId: imdbIdSchema
});

export function normalizeImdbId(value: string): string {
  return value.trim().toLowerCase();
}

export function validateImdbId(value: string): { ok: true; imdbId: string } | { ok: false; error: string } {
  const parsed = imdbIdSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid IMDb ID" };
  }

  return { ok: true, imdbId: normalizeImdbId(parsed.data) };
}
