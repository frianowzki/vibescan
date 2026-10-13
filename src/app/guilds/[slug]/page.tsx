import { Suspense } from "react";
import Link from "next/link";
import { PageMain, SiteHeader } from "@/components/Shell";
import { fetchGuilds, fetchGuildMembers, shortAddr, fmtEth, type Guild } from "@/lib/vibe";

async function GuildDetail({ slug }: { slug: string }) {
  let guild: Guild | null = null;
  let members: { address: string; role: string; joinedAt: string }[] = [];
  let err: string | null = null;

  try {
    const { items } = await fetchGuilds(0, 100);
    guild = items.find((g) => g.slug === slug) || null;
    if (!guild) err = "Guild not found.";
  } catch {
    err = "Upstream unavailable — try again shortly.";
  }

  if (err) return <p className="text-sm text-[var(--warn)]">{err}</p>;
  if (!guild) return <p className="text-sm text-[var(--fg-dim)]">Loading…</p>;

  try {
    const d = await fetchGuildMembers(slug);
    members = d.items || [];
  } catch {
    // members optional
  }

  const gms = members.filter((m) => m.role === "GUILDMASTER");
  const shown = members.slice(0, 100);
  const m = guild.metrics || {};

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--fg-faint)]">Guild</p>
        <h1 className="text-2xl font-bold tracking-tight">{guild.name}</h1>
        {guild.ethos && <p className="text-sm text-[var(--fg-dim)] mt-1">{guild.ethos}</p>}
        <div className="flex gap-4 text-xs text-[var(--fg-dim)] mt-2 flex-wrap">
          <span>{guild.memberCount} members</span>
          <span>{guild.admissionPolicy}</span>
          {guild.contactXUsername && (
            <a
              href={`https://x.com/${guild.contactXUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--fg)]"
            >
              @{guild.contactXUsername}
            </a>
          )}
          <a
            href={`https://explorer.testnet.chain.robinhood.com/address/${guild.founderAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline underline-offset-2 hover:text-[var(--fg)]"
          >
            founder {shortAddr(guild.founderAddress)}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Trading volume</p>
          <p className="text-xl font-bold font-mono">
            {m.tradingVolumeWei ? `${fmtEth(m.tradingVolumeWei)} ETH` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Trader referrals</p>
          <p className="text-xl font-bold font-mono">{Number(m.traderReferrals || 0).toLocaleString("en-US")}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Trader ref. volume</p>
          <p className="text-xl font-bold font-mono">
            {m.traderReferralVolumeWei ? `${fmtEth(m.traderReferralVolumeWei)} ETH` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--fg-faint)]">Project ref. volume</p>
          <p className="text-xl font-bold font-mono">
            {m.projectReferralVolumeWei ? `${fmtEth(m.projectReferralVolumeWei)} ETH` : "—"}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--fg-dim)] mb-3">
          Members {members.length > 0 && <span className="text-[var(--fg-faint)]">({members.length} listed)</span>}
        </h2>
        {shown.length === 0 ? (
          <p className="text-sm text-[var(--fg-dim)]">Member list unavailable.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--fg-faint)] border-b border-[var(--line)]">
                  <th className="py-2 pr-4">Wallet</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((mem) => (
                  <tr key={mem.address} className="border-b border-[var(--line)]">
                    <td className="py-2 pr-4">
                      <Link href={`/w/${mem.address}`} className="font-mono text-xs hover:text-[var(--accent)] transition-colors">
                        {shortAddr(mem.address)}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {mem.role === "GUILDMASTER" ? (
                        <span className="text-[var(--accent)]">guildmaster</span>
                      ) : (
                        <span className="text-[var(--fg-faint)]">{mem.role.toLowerCase()}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-xs text-[var(--fg-dim)]">
                      {mem.joinedAt && !isNaN(new Date(mem.joinedAt).getTime())
                        ? new Date(mem.joinedAt).toISOString().slice(0, 10)
                        : "—"}
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

function Skeleton() {
  return <div className="h-64 rounded bg-[var(--bg-hover)] animate-pulse" />;
}

export default function GuildDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="/guilds" />
      <PageMain>
        <Suspense fallback={<Skeleton />}>
          <GuildDetailWrapper params={params} />
        </Suspense>
        <p className="text-xs text-[var(--fg-faint)] mt-8">
          Testnet data has no monetary value. Not affiliated with vibe/vibe or Seedify.
        </p>
      </PageMain>
    </div>
  );
}

async function GuildDetailWrapper({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GuildDetail slug={slug} />;
}
