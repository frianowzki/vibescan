import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import TokenDetail from "./TokenDetail";
import { fetchLaunchDetail } from "@/lib/vibe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  try {
    const { launch } = await fetchLaunchDetail(address);
    const pct = (() => {
      const target = BigInt(launch.targetPairUnits || "0");
      const raised = BigInt(launch.curve?.pairReserveUnits || "0");
      return target ? Number((raised * 10000n) / target) / 100 : 0;
    })();
    const title = `${launch.name} (${launch.symbol}) · vibescan`;
    const desc = `vibe/vibe testnet launch — ${pct.toFixed(1)}% to graduation · tax ${launch.taxBps / 100}% · pair ${launch.pairSymbol} · Unofficial scanner`;
    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
      },
    };
  } catch {
    return { title: "token · vibescan" };
  }
}

function TokenSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-8 w-64 rounded bg-[var(--bg-hover)]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded bg-[var(--bg-hover)]" />
        ))}
      </div>
      <div className="h-44 rounded bg-[var(--bg-hover)]" />
    </div>
  );
}

async function TokenContent({ address }: { address: string }) {
  let detail = null;
  let error: string | null = null;
  try {
    detail = await fetchLaunchDetail(address);
  } catch {
    error =
      "Could not load this launch from the vibe/vibe API. It may not exist, or upstream is flaky — try again shortly.";
  }

  if (error) return <p className="text-sm text-[var(--warn)]">{error}</p>;
  if (!detail) return <p className="text-sm text-[var(--fg-dim)]">Loading…</p>;
  return <TokenDetail detail={detail} />;
}

export default function TokenPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--line)] px-5 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          vibe<span className="text-[var(--accent)]">scan</span>
        </Link>
        <Link
          href="/"
          className="text-xs text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors"
        >
          ← all launches
        </Link>
      </header>
      <main className="flex-1 p-5 md:p-8 max-w-5xl w-full mx-auto">
        <Suspense fallback={<TokenSkeleton />}>
          <TokenContentWrapper params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function TokenContentWrapper({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <TokenContent address={address} />;
}
