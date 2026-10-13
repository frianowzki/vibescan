import LaunchTable from "./LaunchTable";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left rail */}
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[var(--line)] p-5 md:min-h-screen md:sticky md:top-0 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            vibe<span className="text-[var(--accent)]">scan</span>
          </h1>
          <p className="text-xs text-[var(--fg-dim)] mt-1 leading-relaxed">
            Unofficial scanner for the vibe/vibe launchpad — Robinhood Chain Testnet (chain
            46630)
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-xs">
          <a href="/buybacks" className="text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors">Buybacks &amp; burns ↗</a>
          <a href="/builders" className="text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors">Builders ↗</a>
          <a href="/guilds" className="text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors">Guilds ↗</a>
        </nav>

        <nav className="mt-auto flex gap-4 text-xs text-[var(--fg-dim)]">
          <a
            href="https://testnet.vibevibe.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] transition-colors"
          >
            app ↗
          </a>
          <a
            href="https://testnet.vibevibe.fun/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] transition-colors"
          >
            docs ↗
          </a>
          <a
            href="https://x.com/vibevibefun"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] transition-colors"
          >
            X ↗
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-8 max-w-6xl">
        <LaunchTable />
        <p className="text-xs text-[var(--fg-faint)] mt-8 leading-relaxed">
          Testnet data has no monetary value. Progress = curve reserve vs fixed graduation
          target. Not affiliated with vibe/vibe or Seedify.
        </p>
      </main>
    </div>
  );
}
