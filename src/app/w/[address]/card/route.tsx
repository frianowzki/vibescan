import { ImageResponse } from "next/og";
import { fetchWalletPerformance, fetchWalletPositions, fmtEth } from "@/lib/vibe";

export const contentType = "image/png";

function pnlColor(v: string): string {
  try {
    return BigInt(v) >= 0n ? "#dff902" : "#ff5470";
  } catch {
    return "#ececee";
  }
}

function signed(v: string): string {
  try {
    return Number(BigInt(v)) >= 0 ? "+" : "";
  } catch {
    return "";
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  let pnl = "0";
  let trades = 0;
  let tokens = 0;
  let wr30 = "—";
  let coverage = "";

  try {
    const [perf, positions] = await Promise.all([
      fetchWalletPerformance(address),
      fetchWalletPositions(address),
    ]);
    pnl = perf.realizedPnlWei;
    trades = perf.accountedTrades;
    coverage = perf.coverage;
    const w30 = perf.windows?.items?.find((w) => w.window === "30D");
    if (w30 && w30.scoredCloses > 0) {
      wr30 = `${Math.round((100 * w30.winningCloses) / w30.scoredCloses)}%`;
    }
    tokens = positions.length;
  } catch {
    // card still renders with defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          color: "#ececee",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#dff902" }}>vibescan</div>
          <div style={{ fontSize: 24, color: "#8a8a90" }}>wallet report card · testnet</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 30, color: "#8a8a90", fontFamily: "monospace", display: "flex" }}>
            {address.slice(0, 10)}…{address.slice(-8)}
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 1,
              color: pnlColor(pnl),
              display: "flex",
            }}
          >
            {signed(pnl)}
            {fmtEth(pnl)} ETH
          </div>
          <div style={{ fontSize: 30, color: "#8a8a90", display: "flex", gap: 32 }}>
            <span style={{ display: "flex" }}>realized PnL</span>
            <span style={{ display: "flex" }}>win rate 30D {wr30}</span>
            <span style={{ display: "flex" }}>
              {trades} trades · {tokens} tokens
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#5a5a60" }}>
          <span style={{ display: "flex" }}>
            {coverage ? `coverage ${coverage.toLowerCase()}` : "unofficial scanner"}
          </span>
          <span style={{ display: "flex" }}>vibescan-testnet.vercel.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
