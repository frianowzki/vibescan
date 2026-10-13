import { NextResponse } from "next/server";
import { fetchGuilds } from "@/lib/vibe";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const offset = Math.max(0, Number(sp.get("offset") ?? 0) || 0);
  try {
    const data = await fetchGuilds(offset, 24);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
