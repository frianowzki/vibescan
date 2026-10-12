"use client";

interface Point {
  t: number; // ms
  v: number; // price in ETH
}

// Pure-SVG price line — no chart lib, honest gaps for missing buckets.
export default function Sparkline({
  candles,
  width = 640,
  height = 180,
}: {
  candles: { bucketStart: string; closePriceWeiPerToken: string | null }[];
  width?: number;
  height?: number;
}) {
  const points: Point[] = candles
    .filter((c) => c.closePriceWeiPerToken)
    .map((c) => ({
      t: new Date(c.bucketStart).getTime(),
      v: Number(BigInt(c.closePriceWeiPerToken as string)) / 1e18,
    }));

  if (points.length < 2) {
    return (
      <div className="text-xs text-[var(--fg-faint)] py-10 text-center border border-[var(--line)] rounded-lg">
        Not enough price history yet.
      </div>
    );
  }

  const pad = 8;
  const ts = points.map((p) => p.t);
  const vs = points.map((p) => p.v);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const vMin = Math.min(...vs);
  const vMax = Math.max(...vs);
  const tSpan = tMax - tMin || 1;
  const vSpan = vMax - vMin || vMax * 0.1 || 1;

  const xy = points.map((p) => [
    pad + ((p.t - tMin) / tSpan) * (width - pad * 2),
    height - pad - ((p.v - vMin) / vSpan) * (height - pad * 2),
  ]);

  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${height - pad} L${xy[0][0].toFixed(1)},${height - pad} Z`;
  const last = vs[vs.length - 1];
  const first = vs[0];
  const up = last >= first;
  const stroke = up ? "var(--good)" : "var(--bad)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="price chart">
      <path d={area} fill={stroke} opacity="0.08" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" />
      <circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r="2.5" fill={stroke} />
    </svg>
  );
}
