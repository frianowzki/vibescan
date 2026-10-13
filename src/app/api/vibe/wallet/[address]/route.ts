import { NextResponse } from "next/server";
import { fetchWalletPerformance, fetchWalletPositions } from "@/lib/vibe";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  try {
    const [performance, positions] = await Promise.all([
      fetchWalletPerformance(address),
      fetchWalletPositions(address),
    ]);
    return NextResponse.json(
      { data: { performance, positions } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
