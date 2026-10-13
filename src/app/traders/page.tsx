import { Suspense } from "react";
import { PageMain, SiteHeader } from "@/components/Shell";
import { fetchTopTraders, fmtEth, type TraderRow } from "@/lib/vibe";

function pnlClass(v: string): string {
  try {
    return BigInt(v) >= 0n ? "text-[var(--accent)]" : "text-[var(--bad,#ff5470)]";
  } catch {
    return "";
  }
}

function signed(v: string): string {
  return Number(BigInt(v)) >= 0 ? "+" : "";
}

function Table({ title, items }: { title: string; items: TraderRow[] }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--fg-dim)] mb-3">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--fg-faint)] border-b border-[var(--line)]">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Trader</th>
              <th className="py-2 pr-4">Total PnL</th>
              <th className="py-2 pr-4">Realized</th>
              <th className="py-2 pr-4">Unrealized</th>
              <th className="py-2 pr-4">Equity</th>
              <th className="py-2 pr-4">Trades</th>
              <th className="py-2 pr-4">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => (
              <tr key={t.address} className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-mono text-[var(--fg-faint)]">{i + 1}</td>
                <td className="py-2 pr-4">
                  <a
                    href={`/w/${t.address}`}
                    className="font-mono text-xs hover:text-[var(--accent)] transition-colors"
                  >
                    {t.address.slice(0, 6)}…{t.address.slice(-4)}
                  </a>
                  {t.coverage !== "COMPLETE" && (
                    <span className="ml-2 text-[10px] uppercase text-[var(--fg-faint)]">{t.coverage.toLowerCase()}</span>
                  )}
                </td>
                <td className={`py-2 pr-4 font-mono font-semibold ${pnlClass(t.pnlWei)}`}>
                  {signed(t.pnlWei)}{fmtEth(t.pnlWei)} ETH
                </td>
                <td className={`py-2 pr-4 font-mono ${pnlClass(t.realizedPnlWei)}`}>
                  {signed(t.realizedPnlWei)}{fmtEth(t.realizedPnlWei)}
                </td>
                <td className={`py-2 pr-4 font-mono ${pnlClass(t.unrealizedPnlWei)}`}>
                  {signed(t.unrealizedPnlWei)}{fmtEth(t.unrealizedPnlWei)}
                </td>
                <td className="py-2 pr-4 font-mono">{fmtEth(t.equityWei)}</td>
                <td className="py-2 pr-4 font-mono">{t.buyCount + t.sellCount}</td>
                <td className="py-2 pr-4 font-mono">{t.tokensTraded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

async function Boards() {
  const { items } = await fetchTopTraders();
  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Traders</p>
        <h1 className="text-2xl font-bold tracking-tight">Top PnL leaderboard</h1>
        <p className="text-xs text-[var(--fg-dim)] mt-1 max-w-2xl leading-relaxed">
          Ranked by total PnL (realized + unrealized) across the vibe/vibe testnet. Click a trader
          for the full wallet profile — windows, win rate, positions.
        </p>
      </div>
      {items.length > 0 ? (
        <Table title="All time" items={items} />
      ) : (
        <p className="text-sm text-[var(--fg-dim)]">Trader board unavailable right now.</p>
      )}
    </div>
  );
}

function Skeleton() {
  return <div className="h-64 rounded bg-[var(--bg-hover)] animate-pulse" />;
}

export default function TradersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="/traders" />
      <PageMain>
        <Suspense fallback={<Skeleton />}>
          <Boards />
        </Suspense>
        <p className="text-xs text-[var(--fg-faint)] mt-8">
          Testnet data has no monetary value. Not affiliated with vibe/vibe or Seedify.
        </p>
      </PageMain>
    </div>
  );
}
