import { Suspense } from "react";
import Link from "next/link";
import { PageMain, SiteHeader } from "@/components/Shell";
import { fetchBuilders, shortAddr, type BuilderRow } from "@/lib/vibe";

function Table({ title, items }: { title: string; items: BuilderRow[] }) {
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
              <th className="py-2 pr-4">Builder</th>
              <th className="py-2 pr-4">Launches</th>
              <th className="py-2 pr-4">Latest launch</th>
              <th className="py-2 pr-4">Best current</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.creatorAddress} className="border-b border-[var(--line)]">
                <td className="py-2 pr-4 font-mono text-[var(--fg-faint)]">{b.rank}</td>
                <td className="py-2 pr-4">
                  <a
                    href={`https://explorer.testnet.chain.robinhood.com/address/${b.creatorAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs hover:text-[var(--accent)] transition-colors"
                  >
                    {shortAddr(b.creatorAddress)}
                  </a>
                </td>
                <td className="py-2 pr-4 font-mono">{b.launchCount}</td>
                <td className="py-2 pr-4 text-xs text-[var(--fg-dim)]">
                  {b.latestLaunchAt && !isNaN(new Date(b.latestLaunchAt).getTime())
                    ? new Date(b.latestLaunchAt).toISOString().slice(0, 10)
                    : "—"}
                </td>
                <td className="py-2 pr-4">
                  {b.bestCurrent ? (
                    <Link href={`/t/${b.bestCurrent.tokenAddress}`} className="hover:text-[var(--accent)] transition-colors">
                      {b.bestCurrent.symbol}
                      <span className="text-xs text-[var(--fg-faint)]"> {b.bestCurrent.lifecycle}</span>
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

async function Boards() {
  const [all, season] = await Promise.all([fetchBuilders(false, 25), fetchBuilders(true, 25)]);
  const sReady = season.boardStatus === "READY";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Builders</p>
        <h1 className="text-2xl font-bold tracking-tight">Who&apos;s shipping</h1>
        <p className="text-xs text-[var(--fg-dim)] mt-1 max-w-2xl leading-relaxed">
          Ranked by launch activity across the vibe/vibe launchpad. Season board: {sReady ? "live" : season.boardStatus.toLowerCase()}
          {season.scope ? ` · ${JSON.stringify(season.scope)}` : ""}.
        </p>
      </div>
      {sReady && season.items.length > 0 && <Table title="This season" items={season.items} />}
      {all.items.length > 0 && <Table title="All time" items={all.items} />}
      {all.items.length === 0 && (
        <p className="text-sm text-[var(--fg-dim)]">Builder board unavailable ({all.boardStatus}).</p>
      )}
    </div>
  );
}

function Skeleton() {
  return <div className="h-64 rounded bg-[var(--bg-hover)] animate-pulse" />;
}

export default function BuildersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="/builders" />
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
