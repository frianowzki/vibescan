import { Suspense } from "react";
import Link from "next/link";
import { PageMain, SiteHeader } from "@/components/Shell";
import { fetchBuybackSummary, fmtEth, shortAddr } from "@/lib/vibe";

async function Buybacks() {
  const s = await fetchBuybackSummary();
  const totalEth = s.items.reduce((a, t) => a + BigInt(t.ethSpentWei || "0"), 0n);
  const totalBurned = s.items.reduce((a, t) => a + BigInt(t.tokensBurnedBaseUnits || "0"), 0n);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Buyback &amp; Burn</p>
        <h1 className="text-2xl font-bold tracking-tight">Protocol fee sink</h1>
        <p className="text-xs text-[var(--fg-dim)] mt-1 max-w-2xl leading-relaxed">
          Curve fees route partly to the protocol; part of that treasury buys tokens back and burns
          them — sent to an irrecoverable burn address. Keeper-authorized execution.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">ETH spent (tracked)</p>
          <p className="text-xl font-bold font-mono">{fmtEth(totalEth.toString())} ETH</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Tokens burned</p>
          <p className="text-xl font-bold font-mono">
            {(Number(totalBurned) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Tokens w/ buybacks</p>
          <p className="text-xl font-bold font-mono">{s.items.length}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">SFUND sink</p>
          <p className="text-xl font-bold font-mono">{s.sfund?.status || "—"}</p>
          <p className="text-[11px] text-[var(--fg-faint)]">{s.sfund?.executionCount ?? 0} executions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--fg-faint)] border-b border-[var(--line)]">
              <th className="py-2 pr-4">Token</th>
              <th className="py-2 pr-4">ETH spent</th>
              <th className="py-2 pr-4">Burned</th>
              <th className="py-2 pr-4">Executions</th>
              <th className="py-2 pr-4">Last burn</th>
              <th className="py-2 pr-4">Tx</th>
            </tr>
          </thead>
          <tbody>
            {s.items.map((t) => (
              <tr key={t.tokenAddress} className="border-b border-[var(--line)]">
                <td className="py-2 pr-4">
                  <Link href={`/t/${t.tokenAddress}`} className="font-mono text-xs hover:text-[var(--accent)] transition-colors">
                    {shortAddr(t.tokenAddress)}
                  </Link>
                </td>
                <td className="py-2 pr-4 font-mono">{fmtEth(t.ethSpentWei)} ETH</td>
                <td className="py-2 pr-4 font-mono text-xs">
                  {(Number(BigInt(t.tokensBurnedBaseUnits || "0")) / 1e18).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="py-2 pr-4 font-mono">{t.executionCount}</td>
                <td className="py-2 pr-4 text-xs text-[var(--fg-dim)]">
                  {t.lastBurnAt ? new Date(t.lastBurnAt).toISOString().slice(0, 10) : "—"}
                </td>
                <td className="py-2 pr-4">
                  {t.lastBurnTxHash ? (
                    <a
                      href={`https://explorer.testnet.chain.robinhood.com/tx/${t.lastBurnTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--fg-dim)] hover:text-[var(--fg)] underline underline-offset-2"
                    >
                      ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="h-64 rounded bg-[var(--bg-hover)] animate-pulse" />;
}

export default function BuybacksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="/buybacks" />
      <PageMain>
        <Suspense fallback={<Skeleton />}>
          <Buybacks />
        </Suspense>
        <p className="text-xs text-[var(--fg-faint)] mt-8">
          Testnet data has no monetary value. Not affiliated with vibe/vibe or Seedify.
        </p>
      </PageMain>
    </div>
  );
}
