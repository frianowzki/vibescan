import { NextResponse } from "next/server";
import { fetchBuilders } from "@/lib/vibe";

export async function GET(req: Request) {
  const season = new URL(req.url).searchParams.get("season") === "1";
  try {
    const data = await fetchBuilders(season, 25);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
