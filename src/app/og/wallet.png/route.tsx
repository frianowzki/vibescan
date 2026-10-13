import { ImageResponse } from "next/og";

export const contentType = "image/png";

export function GET() {
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

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, display: "flex" }}>
            Wallet PnL profiles
          </div>
          <div style={{ fontSize: 30, color: "#8a8a90", display: "flex" }}>
            realized PnL · win rate · positions — for every trader on vibe/vibe
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#5a5a60" }}>
          <span style={{ display: "flex" }}>open any /w/0x… link to see the live card</span>
          <span style={{ display: "flex" }}>vibescan-testnet.vercel.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
