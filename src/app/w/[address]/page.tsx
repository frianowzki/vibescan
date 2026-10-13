import { Suspense } from "react";
import { PageMain, SiteHeader } from "@/components/Shell";
import WalletProfile from "./WalletProfile";

function Skeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-80 rounded bg-[var(--bg-hover)]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded bg-[var(--bg-hover)]" />
        ))}
      </div>
      <div className="h-40 rounded bg-[var(--bg-hover)]" />
    </div>
  );
}

export default function WalletPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <PageMain>
        <Suspense fallback={<Skeleton />}>
          <WalletProfile params={params} />
        </Suspense>
      </PageMain>
    </div>
  );
}
