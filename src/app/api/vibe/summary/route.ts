import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/vibe";

export async function GET() {
  try {
    const data = await fetchSummary();
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
