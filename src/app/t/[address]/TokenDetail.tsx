"use client";

import { useEffect, useState } from "react";
import type { LaunchDetail, Candle, FeeEvent } from "@/lib/vibe";
import { fmtEth, shortAddr } from "@/lib/vibe";
import Sparkline from "../../Sparkline";

const INTERVALS = ["15m", "1h", "4h", "1d"] as const;

function progressPct(l: LaunchDetail["launch"]) {
  const target = BigInt(l.targetPairUnits || "0");
  if (target === 0n) return 0;
  const raised = BigInt(l.curve?.pairReserveUnits || "0");
  const bp = (raised * 10000n) / target;
  return Number(bp > 10000n ? 10000n : bp) / 100;
}

function age(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const WEIGHT_LABELS: Record<string, { label: string; color: string }> = {
  cashBps: { label: "Treasury (pair asset)", color: "var(--accent)" },
  holdersBps: { label: "Token holder reflections", color: "var(--good)" },
  burnBps: { label: "Burn", color: "var(--bad)" },
  holdersPairBps: { label: "Pair-asset holder rewards", color: "var(--warn)" },
};

export default function TokenDetail({ detail }: { detail: LaunchDetail }) {
  const l = detail.launch;
  const [interval, setInterval_] = useState<(typeof INTERVALS)[number]>("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [candlesErr, setCandlesErr] = useState(false);

  useEffect(() => {
    let alive = true;
    setCandlesErr(false);
    fetch(`/api/vibe/candles/${l.tokenAddress}?interval=${interval}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => alive && setCandles(j.data?.items ?? []))
      .catch(() => alive && setCandlesErr(true));
    return () => {
      alive = false;
    };
  }, [l.tokenAddress, interval]);

  const pct = progressPct(l);
  const w = l.weights;
  const weightRows = Object.entries(w ?? {})
    .filter(([, bps]) => (bps as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number));
  const weightTotal = weightRows.reduce((s, [, bps]) => s + (bps as number), 0) || 1;

  const fees: FeeEvent[] = detail.feeEvents ?? [];

  const links = (
    <>
      <a
        href={`https://testnet.vibevibe.fun/token/${l.tokenAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[var(--fg)] transition-colors"
      >
        open in app ↗
      </a>
      <a
        href={`https://explorer.testnet.chain.robinhood.com/address/${l.tokenAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[var(--fg)] transition-colors"
      >
        explorer ↗
      </a>
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{l.name}</h1>
          <span className="mono text-[var(--fg-dim)]">${l.symbol}</span>
          <span className="text-xs text-[var(--fg-faint)] mono">{shortAddr(l.tokenAddress)}</span>
          <span className="text-xs">
            {l.graduated || l.lifecycle === "GRADUATED" ? (
              <span className="text-[var(--good)]">graduated</span>
            ) : (
              <span className="text-[var(--fg-dim)]">{l.lifecycle?.toLowerCase()}</span>
            )}
          </span>
          <span className="text-xs text-[var(--fg-faint)]">launched {age(l.createdAt)}</span>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-[var(--fg-dim)]">
          {links}
          <a
            href={`https://explorer.testnet.chain.robinhood.com/tx/${l.createdTransactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] transition-colors"
          >
            creation tx ↗
          </a>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--fg-faint)]">Raised</div>
          <div className="mono text-lg mt-0.5">
            {(Number(BigInt(l.curve?.pairReserveUnits || "0")) / 1e18).toFixed(2)} /{" "}
            {(Number(BigInt(l.targetPairUnits || "0")) / 1e18).toFixed(0)} {l.pairSymbol}
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-hover)] overflow-hidden mt-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "var(--good)" : "var(--accent)",
              }}
            />
          </div>
          <div className="mono text-xs text-[var(--fg-faint)] mt-1">{pct.toFixed(1)}% to graduation</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--fg-faint)]">Base tax</div>
          <div className="mono text-lg mt-0.5">{(l.taxBps / 100).toFixed(1)}%</div>
          <div className="text-xs text-[var(--fg-faint)] mt-2">
            {l.curve?.transfersUnlocked ? "transfers unlocked" : "transfers locked till graduation"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--fg-faint)]">Curve sold</div>
          <div className="mono text-lg mt-0.5">
            {(Number(BigInt(l.curve?.tokensSoldGrossUnits || "0")) / 1e24).toFixed(1)}M{" "}
            {l.symbol}
          </div>
          <div className="text-xs text-[var(--fg-faint)] mt-2">of 800M curve allocation</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--fg-faint)]">Launch ID</div>
          <div className="mono text-lg mt-0.5">#{l.launchId}</div>
          <div className="text-xs text-[var(--fg-faint)] mt-2">
            {l.pairIsNative ? "native pair" : `pair: ${l.pairSymbol}`}
          </div>
        </div>
      </div>

      {/* Chart */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--fg-dim)]">Price (pair per token)</h2>
          <div className="flex gap-1">
            {INTERVALS.map((iv) => (
              <button
                key={iv}
                onClick={() => setInterval_(iv)}
                className={`mono text-xs px-2.5 py-1 rounded-full transition-colors ${
                  interval === iv
                    ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {iv}
              </button>
            ))}
          </div>
        </div>
        {candlesErr ? (
          <div className="text-xs text-[var(--warn)] py-10 text-center border border-[var(--line)] rounded-lg">
            Candle data unavailable right now — upstream flaky.
          </div>
        ) : (
          <Sparkline candles={candles} />
        )}
      </section>

      {/* Tax routing */}
      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--fg-dim)] mb-3">
            Project tax routing <span className="text-[var(--fg-faint)]">({(l.taxBps / 100).toFixed(1)}% base)</span>
          </h2>
          <div className="flex flex-col gap-2.5">
            {weightRows.map(([k, bps]) => {
              const meta = WEIGHT_LABELS[k] ?? { label: k, color: "var(--fg-dim)" };
              return (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{meta.label}</span>
                    <span className="mono text-[var(--fg-dim)]">
                      {((bps as number) / 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-[var(--bg-hover)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((bps as number) / weightTotal) * 100}%`,
                        background: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--fg-faint)] mt-3 leading-relaxed">
            Creator-fixed at launch, immutable. Fixed platform share (20% of tax) routes to
            VIBEVIBE buyback/burn once its pool activates.
          </p>
        </div>

        {/* Recent fee events */}
        <div>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--fg-dim)] mb-3">
            Recent fee events
          </h2>
          {fees.length === 0 ? (
            <p className="text-xs text-[var(--fg-faint)]">No fee events recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5 text-xs">
              {fees.slice(0, 8).map((f, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center gap-3 border-b border-[var(--line)] pb-1.5"
                >
                  <span className={f.side === "BUY" ? "text-[var(--good)]" : "text-[var(--bad)]"}>
                    {f.side} · {f.source?.replace("CURVE_", "")?.toLowerCase()}
                  </span>
                  <span className="mono text-[var(--fg-dim)]">{shortAddr(f.actorAddress ?? "")}</span>
                  <span className="mono">
                    {f.pairFeeUnits ? `${fmtEth(f.pairFeeUnits, 3)} ${l.pairSymbol}` : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {l.content?.description && (
        <section>
          <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--fg-dim)] mb-2">About</h2>
          <p className="text-sm text-[var(--fg-dim)] leading-relaxed max-w-3xl">
            {l.content.description}
          </p>
        </section>
      )}
    </div>
  );
}
