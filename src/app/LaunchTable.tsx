"use client";

import { useCallback, useEffect, useState } from "react";
import type { VibeLaunch } from "@/lib/vibe";
import { fmtEth } from "@/lib/vibe";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function fmtPair(wei: string) {
  const v = Number(BigInt(wei || "0")) / 1e18;
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function progressPct(l: VibeLaunch) {
  const target = BigInt(l.targetPairUnits || "0");
  if (target === 0n) return 0;
  const raised = BigInt(l.curve?.pairReserveUnits || "0");
  const bp = (raised * 10000n) / target;
  return Number(bp > 10000n ? 10000n : bp) / 100;
}

function age(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function lifecycleTag(l: VibeLaunch) {
  if (l.graduated || l.lifecycle === "GRADUATED")
    return <span className="text-[var(--good)]">graduated</span>;
  if (l.lifecycle === "CURVE_TRADING") return <span className="text-[var(--fg-dim)]">on curve</span>;
  return <span className="text-[var(--fg-faint)]">{(l.lifecycle || "").toLowerCase()}</span>;
}

interface Summary {
  population: { tokens: number; traders: number; trades: number; builders: number };
  totals: { cumulativeVolumeWei: string };
}

export default function LaunchTable() {
  const [items, setItems] = useState<VibeLaunch[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/vibe/launches?limit=24", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setItems(json.items ?? []);
      setUpdated(new Date());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 20000);
    return () => clearInterval(id);
  }, [poll]);

  useEffect(() => {
    fetch("/api/vibe/summary", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setSummary(j.data))
      .catch(() => {});
  }, []);

  const stats = summary
    ? [
        { label: "tokens", value: summary.population.tokens.toLocaleString("en-US") },
        { label: "traders", value: summary.population.traders.toLocaleString("en-US") },
        { label: "trades", value: summary.population.trades.toLocaleString("en-US") },
        { label: "volume ETH", value: fmtEth(summary.totals.cumulativeVolumeWei, 0) },
      ]
    : [];

  return (
    <div>
      {stats.length > 0 && (
        <dl className="flex flex-wrap gap-x-10 gap-y-4 mb-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-xs uppercase tracking-wider text-[var(--fg-faint)]">
                {s.label}
              </dt>
              <dd className="mono text-2xl mt-0.5">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--fg-dim)]">
          Latest launches
        </h2>
        <span className="mono text-xs text-[var(--fg-faint)]">
          {failed ? (
            <span className="text-[var(--warn)]">upstream flaky — retrying…</span>
          ) : updated ? (
            `refreshed ${updated.toLocaleTimeString("en-GB")}`
          ) : (
            "auto-refresh 20s"
          )}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--fg-faint)] border-b border-[var(--line)]">
              <th className="py-2 pr-3 font-medium">Token</th>
              <th className="py-2 pr-3 font-medium">Curve progress</th>
              <th className="py-2 pr-3 font-medium text-right">Raised</th>
              <th className="py-2 pr-3 font-medium text-right">Tax</th>
              <th className="py-2 pr-3 font-medium text-right">24h vol</th>
              <th className="py-2 pr-3 font-medium text-right">Holders</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 font-medium text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => {
              const pct = progressPct(l);
              return (
                <tr
                  key={l.tokenAddress}
                  className="border-b border-[var(--line)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="mono text-xs text-[var(--fg-faint)]">
                      {l.symbol} · {shortAddr(l.tokenAddress)}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 min-w-[140px]">
                    <div className="h-1.5 w-full rounded-full bg-[var(--bg-hover)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100 ? "var(--good)" : "var(--accent)",
                        }}
                      />
                    </div>
                    <div className="mono text-xs text-[var(--fg-faint)] mt-1">
                      {pct.toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right mono">
                    {fmtPair(l.curve?.pairReserveUnits)} / {fmtPair(l.targetPairUnits)}{" "}
                    {l.pairSymbol}
                  </td>
                  <td className="py-2.5 pr-3 text-right mono">
                    {(l.taxBps / 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 pr-3 text-right mono">
                    {fmtPair(l.market?.volume24hPairUnits)}
                  </td>
                  <td className="py-2.5 pr-3 text-right mono">{l.market?.holderCount ?? 0}</td>
                  <td className="py-2.5 pr-3 text-xs">{lifecycleTag(l)}</td>
                  <td className="py-2.5 text-right mono text-[var(--fg-faint)]">
                    {age(l.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && <p className="text-sm text-[var(--fg-dim)] py-8">Loading launches…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-[var(--fg-dim)] py-8">
          {failed ? "Upstream unavailable — will retry automatically." : "No launches returned."}
        </p>
      )}
    </div>
  );
}
