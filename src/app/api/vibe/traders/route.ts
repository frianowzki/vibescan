import { NextResponse } from "next/server";
import { fetchTopTraders } from "@/lib/vibe";

export async function GET() {
  try {
    const data = await fetchTopTraders();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
