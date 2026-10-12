import { NextResponse } from "next/server";
import { fetchLaunches } from "@/lib/vibe";

// Route handlers are uncached by default in Next 16.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 24) || 24, 50);
  const sort = searchParams.get("sort") ?? undefined;
  try {
    const items = await fetchLaunches(limit, sort);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
