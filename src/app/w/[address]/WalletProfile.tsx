"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmtEth, shortAddr } from "@/lib/vibe";

interface Perf {
  coverage: string;
  coverageReason: string | null;
  realizedPnlWei: string;
  accountedTrades: number;
  windows: {
    items: {
      window: string;
      buyVolumeWei: string;
      sellVolumeWei: string;
      buyCount: number;
      sellCount: number;
      scoredCloses: number;
      winningCloses: number;
      realizedWei: string;
    }[];
  };
}

interface Position {
  tokenAddress: string;
  name: string;
  symbol: string;
  balanceBaseUnits: string;
  currentPriceWeiPerToken: string | null;
  estimatedValueWei: string | null;
  coverage: string;
  coverageReason?: string | null;
}

function pnlColor(v: string): string {
  try {
    return BigInt(v) >= 0n ? "text-[var(--accent)]" : "text-[var(--red,#ff5470)]";
  } catch {
    return "";
  }
}

export default function WalletProfile({ params }: { params: Promise<{ address: string }> }) {
  const [address, setAddress] = useState<string | null>(null);
  const [perf, setPerf] = useState<Perf | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    params.then((p) => setAddress(p.address.toLowerCase()));
  }, [params]);

  useEffect(() => {
    if (!address) return;
    let live = true;
    (async () => {
      try {
        const r = await fetch(`/api/vibe/wallet/${address}`);
        if (!r.ok) throw new Error();
        const j = await r.json();
        if (live) {
          setPerf(j.data.performance);
          setPositions(j.data.positions || []);
        }
      } catch {
        if (live) setErr(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [address]);

  if (err)
    return (
      <p className="text-sm text-[var(--fg-dim)]">
        Wallet data unavailable (upstream error). <Link href="/" className="underline">← back</Link>
      </p>
    );
  if (!perf) return <p className="text-sm text-[var(--fg-dim)] animate-pulse">Loading wallet…</p>;

  const wins = perf.windows?.items || [];
  const win7 = wins.find((w) => w.window === "7D");
  const win30 = wins.find((w) => w.window === "30D");
  const winRate = (w?: { scoredCloses: number; winningCloses: number }) =>
    w && w.scoredCloses > 0 ? `${Math.round((w.winningCloses / w.scoredCloses) * 100)}%` : "—";
  const valued = positions.filter((p) => p.estimatedValueWei);
  const portfolioEth = valued.reduce((a, p) => a + BigInt(p.estimatedValueWei!), 0n);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Wallet</p>
        <h1 className="text-2xl font-bold font-mono break-all">{address}</h1>
        <p className="text-xs text-[var(--fg-dim)] mt-1">
          coverage {perf.coverage}
          {perf.coverageReason ? ` · ${perf.coverageReason}` : ""} · {perf.accountedTrades} trades
          accounted
        </p>
        <a
          href={`https://explorer.testnet.chain.robinhood.com/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--fg-dim)] hover:text-[var(--fg)] underline underline-offset-2"
        >
          explorer ↗
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Realized PnL</p>
          <p className={`text-xl font-bold font-mono ${pnlColor(perf.realizedPnlWei)}`}>
            {Number(BigInt(perf.realizedPnlWei)) >= 0 ? "+" : ""}
            {fmtEth(perf.realizedPnlWei)} ETH
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Portfolio value</p>
          <p className="text-xl font-bold font-mono">{fmtEth(portfolioEth.toString())} ETH</p>
          <p className="text-[11px] text-[var(--fg-faint)]">{valued.length}/{positions.length} positions priced</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Win rate 7D</p>
          <p className="text-xl font-bold font-mono">{winRate(win7)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Win rate 30D</p>
          <p className="text-xl font-bold font-mono">{winRate(win30)}</p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--fg-dim)] mb-3">
          Trading windows
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--fg-faint)] border-b border-[var(--line)]">
                <th className="py-2 pr-4">Window</th>
                <th className="py-2 pr-4">Buy vol</th>
                <th className="py-2 pr-4">Sell vol</th>
                <th className="py-2 pr-4">Trades</th>
                <th className="py-2 pr-4">Closes</th>
                <th className="py-2 pr-4">Realized</th>
              </tr>
            </thead>
            <tbody>
              {wins.map((w) => (
                <tr key={w.window} className="border-b border-[var(--line)]">
                  <td className="py-2 pr-4 font-semibold">{w.window}</td>
                  <td className="py-2 pr-4 font-mono">{fmtEth(w.buyVolumeWei)}</td>
                  <td className="py-2 pr-4 font-mono">{fmtEth(w.sellVolumeWei)}</td>
                  <td className="py-2 pr-4 font-mono">{w.buyCount + w.sellCount}</td>
                  <td className="py-2 pr-4 font-mono">
                    {w.winningCloses}/{w.scoredCloses}
                  </td>
                  <td className={`py-2 pr-4 font-mono font-semibold ${pnlColor(w.realizedWei)}`}>
                    {Number(BigInt(w.realizedWei)) >= 0 ? "+" : ""}
                    {fmtEth(w.realizedWei)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--fg-dim)] mb-3">
          Positions
        </h2>
        {positions.length === 0 ? (
          <p className="text-sm text-[var(--fg-dim)]">No open positions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--fg-faint)] border-b border-[var(--line)]">
                  <th className="py-2 pr-4">Token</th>
                  <th className="py-2 pr-4">Balance</th>
                  <th className="py-2 pr-4">Value</th>
                  <th className="py-2 pr-4">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.tokenAddress} className="border-b border-[var(--line)]">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/t/${p.tokenAddress}`}
                        className="hover:text-[var(--accent)] transition-colors"
                      >
                        {p.symbol || shortAddr(p.tokenAddress)}
                        <span className="text-[var(--fg-faint)] text-xs"> {p.name}</span>
                      </Link>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {(Number(BigInt(p.balanceBaseUnits)) / 1e18).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {p.estimatedValueWei ? `${fmtEth(p.estimatedValueWei)} ETH` : "—"}
                    </td>
                    <td className="py-2 pr-4 text-xs text-[var(--fg-faint)]">
                      {p.coverage === "UNAVAILABLE" ? p.coverageReason || p.coverage : p.coverage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
