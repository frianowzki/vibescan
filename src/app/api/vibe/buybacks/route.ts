import { NextResponse } from "next/server";
import { fetchBuybackSummary } from "@/lib/vibe";

export async function GET() {
  try {
    const data = await fetchBuybackSummary();
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
