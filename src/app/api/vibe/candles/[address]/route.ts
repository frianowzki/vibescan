import { NextResponse } from "next/server";
import { fetchCandles } from "@/lib/vibe";

const INTERVALS = new Set(["1m", "5m", "15m", "1h", "4h", "1d"]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const interval = new URL(req.url).searchParams.get("interval") ?? "1h";
  if (!INTERVALS.has(interval)) {
    return NextResponse.json({ error: "invalid interval" }, { status: 400 });
  }
  try {
    const data = await fetchCandles(address, interval);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
