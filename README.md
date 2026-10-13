# vibescan

Unofficial real-time scanner for the [vibe/vibe launchpad](https://testnet.vibevibe.fun) on **Robinhood Chain Testnet** (chain ID 46630).

**Live:** https://vibescan-testnet.vercel.app

## Features

- **Launch feed** — every vibe/vibe V6 launch with bonding-curve progress (reserve vs graduation target), tax, 24h volume, holders, lifecycle status; auto-refresh every 20s
- **Tabs** — Latest / Approaching graduation (3–99%, sorted by progress) / Graduated
- **Token pages** `/t/0x…` — interactive SVG price chart (15m/1h/4h/1d), tax-routing breakdown, live fee events, links to the official app & block explorer
- **Wallet profiler** `/w/0x…` — realized PnL, trading windows (24H/7D/30D/ALL), win rate, open positions; linked from every fee event
- **Buyback & burn tracker** `/buybacks` — protocol fee sink across all tokens with tx-level verification
- **Builders leaderboard** `/builders` — all-time + season boards
- **Guilds directory** `/guilds` — every registered guild with membership & volume
- Dynamic OpenGraph metadata per token page

## Architecture

- **Next.js 16** (App Router, Cache Components / Partial Prerender) + **Tailwind 4** + TypeScript
- The vibe/vibe API rejects requests with foreign `Origin` headers (CORS), so all upstream calls go through **server-side proxy routes** (`/api/vibe/*`) — the browser never talks to upstream directly
- Upstream is occasionally flaky (503s): the client (`src/lib/vibe.ts`) retries with backoff
- No chart library — price charts are hand-rolled SVG (`src/app/Sparkline.tsx`)
- Editorial dark/light theme via CSS custom properties (`src/app/globals.css`)

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
```

## Notes

- Testnet data has no monetary value.
- Not affiliated with vibe/vibe or Seedify.
- Data source: `https://testnet.vibevibe.fun/api/v1/chains/46630/…` (unofficial, observed public endpoints).
