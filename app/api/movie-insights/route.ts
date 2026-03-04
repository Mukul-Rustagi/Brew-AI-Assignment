import { NextRequest, NextResponse } from "next/server";
import { getMovieInsights } from "@/lib/movie-service";
import { validateImdbId } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { imdbId?: string };
    const validation = validateImdbId(body?.imdbId ?? "");

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = await getMovieInsights(validation.imdbId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status = message.includes("Missing required environment variable") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
