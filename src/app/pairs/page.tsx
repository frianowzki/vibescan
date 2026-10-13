import { Suspense } from "react";
import { PageMain, SiteHeader } from "@/components/Shell";
import { fetchLaunches, fetchSummary } from "@/lib/vibe";

const SPCX = "0x5a5398155d98374c0e26265ea3cb9818169c2739";

async function PairsBoard() {
  const [launches, summary] = await Promise.all([
    fetchLaunches(50).catch(() => []),
    fetchSummary().catch(() => null),
  ]);

  const dist = new Map<string, { count: number; isSpcx: boolean }>();
  for (const l of launches) {
    const sym = l.pairSymbol || "unknown";
    const isSpcx = (l.pairCurrencyAddress || "").toLowerCase() === SPCX;
    const cur = dist.get(sym) || { count: 0, isSpcx };
    cur.count += 1;
    dist.set(sym, cur);
  }
  const rows = [...dist.entries()].sort((a, b) => b[1].count - a[1].count);
  const total = launches.length || 1;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Pairs</p>
        <h1 className="text-2xl font-bold tracking-tight">Quote asset distribution</h1>
        <p className="text-xs text-[var(--fg-dim)] mt-1 max-w-2xl leading-relaxed">
          Which quote assets launches are paired against — last {launches.length} launches.
          SPCX (tokenized-stock quote) is the newer pair asset being rolled out on testnet.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--fg-dim)] mb-3">
          Distribution
        </h2>
        <div className="flex flex-col gap-3">
          {rows.map(([sym, { count, isSpcx }]) => (
            <div key={sym}>
              <div className="flex justify-between text-xs mb-1">
                <span className={isSpcx ? "text-[var(--accent)] font-semibold" : ""}>
                  {sym}
                  {isSpcx && " · stock quote"}
                </span>
                <span className="font-mono text-[var(--fg-faint)]">
                  {count} ({((count / total) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-hover)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(count / total) * 100}%`,
                    background: isSpcx ? "var(--good)" : "var(--accent)",
                  }}
                />
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-[var(--fg-dim)]">No launches returned right now.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--fg-dim)] mb-3">
          SPCX reference
        </h2>
        <div className="border border-[var(--line)] rounded-lg p-4 bg-[var(--bg-raised)] flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--fg-dim)]">Contract</span>
            <span className="font-mono text-xs">{SPCX.slice(0, 10)}…{SPCX.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--fg-dim)]">Type</span>
            <span>Tokenized-stock quote (test stock pairs, no monetary value)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--fg-dim)]">Pricing source</span>
            <span className="font-mono text-xs">V4_CONVERSION_POOL_X_ETH_USD</span>
          </div>
          {summary && (
            <div className="flex justify-between">
              <span className="text-[var(--fg-dim)]">Ecosystem</span>
              <span className="font-mono text-xs">
                {summary.population.tokens.toLocaleString("en-US")} tokens ·{" "}
                {summary.population.trades.toLocaleString("en-US")} trades
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Skeleton() {
  return <div className="h-64 rounded bg-[var(--bg-hover)] animate-pulse" />;
}

export default function PairsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="/pairs" />
      <PageMain>
        <Suspense fallback={<Skeleton />}>
          <PairsBoard />
        </Suspense>
        <p className="text-xs text-[var(--fg-faint)] mt-8">
          Testnet data has no monetary value. Not affiliated with vibe/vibe or Seedify.
        </p>
      </PageMain>
    </div>
  );
}
