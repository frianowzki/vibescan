import { Suspense } from "react";
import { PageMain, SiteHeader } from "@/components/Shell";
import { fetchGuilds, fmtEth, shortAddr, type Guild } from "@/lib/vibe";

function GuildCard({ g }: { g: Guild }) {
  return (
    <div className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-2 bg-[var(--bg-raised)]">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold tracking-tight">{g.name}</h3>
        <span className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">
          {g.memberCount} members
        </span>
      </div>
      <p className="text-xs text-[var(--fg-dim)] leading-relaxed line-clamp-3">{g.ethos || "—"}</p>
      <div className="flex items-center justify-between text-[11px] text-[var(--fg-faint)] mt-auto pt-2">
        <span>{g.admissionPolicy}</span>
        <span>{g.metrics?.tradingVolumeWei ? `${fmtEth(g.metrics.tradingVolumeWei)} ETH vol` : ""}</span>
      </div>
      <div className="flex gap-3 text-[11px]">
        <a
          href={`https://explorer.testnet.chain.robinhood.com/address/${g.founderAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[var(--fg-dim)] hover:text-[var(--fg)] underline underline-offset-2"
        >
          founder {shortAddr(g.founderAddress)}
        </a>
        {g.contactXUsername && (
          <a
            href={`https://x.com/${g.contactXUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--fg-dim)] hover:text-[var(--fg)] underline underline-offset-2"
          >
            @{g.contactXUsername}
          </a>
        )}
      </div>
    </div>
  );
}

async function GuildGrid() {
  const { items } = await fetchGuilds(0, 48);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Guilds</p>
        <h1 className="text-2xl font-bold tracking-tight">Organized traders</h1>
        <p className="text-xs text-[var(--fg-dim)] mt-1 max-w-2xl leading-relaxed">
          Community coordination layer of the vibe/vibe ecosystem — {items.length} guilds listed.
        </p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((g) => (
          <GuildCard key={g.slug} g={g} />
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-36 rounded bg-[var(--bg-hover)] animate-pulse" />
      ))}
    </div>
  );
}

export default function GuildsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="/guilds" />
      <PageMain>
        <Suspense fallback={<Skeleton />}>
          <GuildGrid />
        </Suspense>
        <p className="text-xs text-[var(--fg-faint)] mt-8">
          Testnet data has no monetary value. Not affiliated with vibe/vibe or Seedify.
        </p>
      </PageMain>
    </div>
  );
}
