"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VibeLaunch } from "@/lib/vibe";
import { fmtEth } from "@/lib/vibe";

const TABS = [
  { key: "starred", label: "★ Starred" },
  { key: "latest", label: "Latest" },
  { key: "approaching", label: "Approaching graduation" },
  { key: "graduated", label: "Graduated" },
] as const;

const STAR_KEY = "vibescan:starred";

function loadStarred(): string[] {
  try {
    const raw = localStorage.getItem(STAR_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function saveStarred(list: string[]) {
  try {
    localStorage.setItem(STAR_KEY, JSON.stringify(list));
  } catch {}
}

type TabKey = (typeof TABS)[number]["key"];

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
  const [tab, setTab] = useState<TabKey>("latest");
  const [starred, setStarred] = useState<string[]>([]);

  useEffect(() => {
    setStarred(loadStarred());
  }, []);

  const toggleStar = useCallback((addr: string) => {
    setStarred((prev) => {
      const next = prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr];
      saveStarred(next);
      return next;
    });
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/vibe/launches?limit=40", { cache: "no-store" });
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

  const filtered = useMemo(() => {
    if (tab === "starred") return items.filter((l) => starred.includes(l.tokenAddress));
    if (tab === "graduated")
      return items.filter((l) => l.graduated || l.lifecycle === "GRADUATED");
    if (tab === "approaching")
      return items
        .filter((l) => !l.graduated && l.lifecycle !== "GRADUATED")
        .filter((l) => {
          const p = progressPct(l);
          return p >= 3 && p < 100;
        })
        .sort((a, b) => progressPct(b) - progressPct(a));
    return items;
  }, [items, tab]);

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

      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                tab === t.key
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
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
              <th className="py-2 pr-3 font-medium w-8"><span className="sr-only">Star</span></th>
              <th className="py-2 pr-3 font-medium">Token</th>
              <th className="py-2 pr-3 font-medium">Curve progress</th>
              <th className="py-2 pr-3 font-medium text-right">Raised</th>
              <th className="py-2 pr-3 font-medium text-right">Tax</th>
              <th className="py-2 pr-3 font-medium text-right">Holders</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 font-medium text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const pct = progressPct(l);
              return (
                <tr
                  key={l.tokenAddress}
                  className="border-b border-[var(--line)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(l.tokenAddress);
                      }}
                      aria-label={starred.includes(l.tokenAddress) ? "Unstar" : "Star"}
                      className={`text-sm transition-colors ${
                        starred.includes(l.tokenAddress)
                          ? "text-[var(--accent)]"
                          : "text-[var(--fg-faint)] hover:text-[var(--fg-dim)]"
                      }`}
                    >
                      {starred.includes(l.tokenAddress) ? "★" : "☆"}
                    </button>
                  </td>
                  <td
                    className="py-2.5 pr-3 cursor-pointer"
                    onClick={() => (window.location.href = `/t/${l.tokenAddress}`)}
                  >
                    <div className="font-medium">{l.name}</div>
                    <div className="mono text-xs text-[var(--fg-faint)]">{l.symbol}</div>
                  </td>
                  <td className="py-2.5 pr-3 min-w-[150px]">
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
                    {(Number(BigInt(l.curve?.pairReserveUnits || "0")) / 1e18).toFixed(2)} /{" "}
                    {(Number(BigInt(l.targetPairUnits || "0")) / 1e18).toFixed(0)}{" "}
                    {l.pairSymbol}
                  </td>
                  <td className="py-2.5 pr-3 text-right mono">
                    {(l.taxBps / 100).toFixed(1)}%
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
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-[var(--fg-dim)] py-8">
          {failed
            ? "Upstream unavailable — will retry automatically."
            : tab === "approaching"
              ? "No launches in the 3–99% graduation window right now."
              : tab === "starred"
                ? "No starred tokens yet — tap ☆ on any launch to track it here."
                : "No launches returned."}
        </p>
      )}
    </div>
  );
}
