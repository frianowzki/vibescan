import Link from "next/link";

const NAV = [
  { href: "/", label: "Discover" },
  { href: "/traders", label: "Traders" },
  { href: "/buybacks", label: "Buybacks" },
  { href: "/builders", label: "Builders" },
  { href: "/guilds", label: "Guilds" },
  { href: "/pairs", label: "Pairs" },
];

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="border-b border-[var(--line)] px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
      <Link href="/" className="text-lg font-bold tracking-tight">
        vibe<span className="text-[var(--accent)]">scan</span>
      </Link>
      <nav className="flex gap-4 text-xs">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`transition-colors ${
              active === n.href
                ? "text-[var(--accent)]"
                : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function PageMain({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 p-5 md:p-8 max-w-5xl w-full mx-auto">{children}</main>;
}
