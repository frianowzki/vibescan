// vibe/vibe testnet API client — server-side only (API blocks foreign Origin headers)
const BASE = "https://testnet.vibevibe.fun";
const CHAIN = 46630;

export interface VibeLaunch {
  tokenAddress: string;
  curveAddress: string;
  launchId: string;
  name: string;
  symbol: string;
  metadataURI?: string;
  pairCurrencyAddress?: string;
  pairIsNative: boolean;
  pairSymbol: string;
  targetPairUnits: string;
  taxBps: number;
  weights: { cashBps: number; holdersBps: number; burnBps: number; holdersPairBps: number };
  lifecycle: string;
  graduated: boolean;
  curve: { tokensSoldGrossUnits: string; pairReserveUnits: string; transfersUnlocked: boolean };
  createdAt: string;
  createdTransactionHash?: string;
  createdBlock?: string;
  market: {
    complete: boolean;
    volume24hPairUnits: string;
    holderCount: number;
    buyCount24h: number;
    sellCount24h: number;
    poolSqrtPriceX96?: string;
    pricePairPerTokenWad?: string;
    [k: string]: unknown;
  };
  content?: { description?: string; image?: { uri?: string } };
}

export interface Candle {
  bucketStart: string;
  openPriceWeiPerToken: string | null;
  highPriceWeiPerToken: string | null;
  lowPriceWeiPerToken: string | null;
  closePriceWeiPerToken: string | null;
  volumeWei: string | null;
}

export interface FeeEvent {
  source: string;
  side: string;
  actorAddress: string;
  pairFeeUnits: string | null;
  tokenFeeUnits: string | null;
  rateBps: number | null;
  grossTokenUnits?: string | null;
  blockNumber?: string | null;
  transactionHash?: string | null;
  [k: string]: unknown;
}

export interface LaunchDetail {
  launch: VibeLaunch;
  feeEvents: FeeEvent[];
  rewardFeeds: unknown[];
  treasuryRotations: unknown[];
}

async function vibeFetch<T>(path: string, tries = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { Accept: "application/json", "User-Agent": "vibescan/0.1" },
      });
      if (!res.ok) throw new Error(`upstream ${res.status}`);
      const json = (await res.json()) as { data: T };
      return json.data;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
    }
  }
  throw lastErr;
}

export async function fetchLaunches(limit = 24, sort?: string): Promise<VibeLaunch[]> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (sort) qs.set("sort", sort);
  const d = await vibeFetch<{ items: VibeLaunch[] }>(
    `/api/v1/chains/${CHAIN}/v6/launches?${qs}`
  );
  return d.items;
}

export async function fetchLaunchDetail(address: string): Promise<LaunchDetail> {
  return vibeFetch<LaunchDetail>(
    `/api/v1/chains/${CHAIN}/v6/launches/${address.toLowerCase()}`
  );
}

export async function fetchCandles(
  address: string,
  interval = "1h"
): Promise<{ items: Candle[] }> {
  return vibeFetch<{ items: Candle[] }>(
    `/api/v1/chains/${CHAIN}/v6/launches/${address.toLowerCase()}/candles?interval=${interval}`
  );
}

export async function fetchActivity(
  address: string
): Promise<{ items: Record<string, unknown>[] }> {
  return vibeFetch<{ items: Record<string, unknown>[] }>(
    `/api/v1/chains/${CHAIN}/launches/${address.toLowerCase()}/activity`
  );
}

export interface AnalyticsSummary {
  population: {
    tokens: number;
    wallets: number;
    builders: number;
    trades: number;
    traders: number;
  };
  totals: { cumulativeVolumeWei: string; realizedPnlWei: string };
}

export async function fetchSummary(): Promise<AnalyticsSummary> {
  const d = await vibeFetch<AnalyticsSummary>(
    `/api/v1/chains/${CHAIN}/analytics/summary`
  );
  return d;
}

// Graduation progress for V6: target is fixed in pair units (default ~4 ETH)
export function gradProgress(l: VibeLaunch): number {
  const target = BigInt(l.targetPairUnits || "0");
  if (target === 0n) return 0;
  const raised = BigInt(l.curve?.pairReserveUnits || "0");
  const pct = (raised * 10000n) / target; // basis points
  return Number(pct > 10000n ? 10000n : pct) / 100;
}

export function fmtEth(wei: string | undefined | null, digits = 2): string {
  if (!wei) return "0";
  const v = Number(BigInt(wei)) / 1e18;
  if (v >= 1000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return v.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// ---------- Wallets ----------

export interface WalletPerformance {
  coverage: string;
  coverageReason: string | null;
  realizedPnlWei: string;
  accountedTrades: number;
  windows: {
    coverage: string;
    items: {
      window: string;
      buyVolumeWei: string;
      sellVolumeWei: string;
      buyCount: number;
      sellCount: number;
      scoredCloses: number;
      winningCloses: number;
      realizedWei: string;
    }[];
  };
}

export async function fetchWalletPerformance(address: string): Promise<WalletPerformance> {
  return vibeFetch<WalletPerformance>(
    `/api/v1/chains/${CHAIN}/wallets/${address.toLowerCase()}/performance`
  );
}

export interface WalletPosition {
  tokenAddress: string;
  name: string;
  symbol: string;
  balanceBaseUnits: string;
  currentPriceWeiPerToken: string | null;
  estimatedValueWei: string | null;
  coverage: string;
  coverageReason?: string | null;
}

export async function fetchWalletPositions(address: string): Promise<WalletPosition[]> {
  const d = await vibeFetch<{ items: WalletPosition[] }>(
    `/api/v1/chains/${CHAIN}/wallets/${address.toLowerCase()}/positions`
  );
  return d.items;
}

// ---------- Buybacks ----------

export interface BuybackSummary {
  launchExecutionCount: number;
  protocolExecutionCount: number;
  totalExecutionCount: number;
  sfund: {
    status: string;
    ethSpentWei: string;
    tokensBurnedBaseUnits: string;
    executionCount: number;
    lastBurnAt: string;
  };
  items: {
    tokenAddress: string;
    ethSpentWei: string;
    tokensBurnedBaseUnits: string;
    executionCount: number;
    lastBurnAt: string;
    lastBurnTxHash: string;
  }[];
}

export async function fetchBuybackSummary(): Promise<BuybackSummary> {
  return vibeFetch<BuybackSummary>(`/api/v1/chains/${CHAIN}/buybacks/summary`);
}

// ---------- Builders / Season ----------

export interface BuilderRow {
  creatorAddress: string;
  rank: number;
  launchCount: number;
  firstLaunchAt: string;
  latestLaunchAt: string;
  pace: { score: number; label: string };
  bestCurrent: {
    tokenAddress: string;
    name: string;
    symbol: string;
    lifecycle: string;
    marketCapWei?: string;
  } | null;
}

export async function fetchBuilders(
  season = false,
  limit = 25
): Promise<{ boardStatus: string; items: BuilderRow[]; scope?: Record<string, unknown> }> {
  const path = season ? "season/builders" : "builders";
  return vibeFetch(`/api/v1/chains/${CHAIN}/${path}?limit=${limit}`);
}

// ---------- Top traders ----------

export interface TraderRow {
  address: string;
  coverage: string;
  coverageReason: string | null;
  realizedPnlWei: string;
  unrealizedPnlWei: string;
  pnlWei: string;
  equityWei: string;
  buyCount: number;
  sellCount: number;
  tokensTraded: number;
  openPositions: number;
}

export async function fetchTopTraders(): Promise<{ items: TraderRow[] }> {
  return vibeFetch<{ items: TraderRow[] }>(
    `/api/v1/chains/${CHAIN}/analytics/traders`
  );
}

// ---------- Guilds ----------

export interface Guild {
  slug: string;
  name: string;
  ethos: string;
  founderAddress: string;
  contactXUsername?: string;
  admissionPolicy: string;
  memberCount: string;
  metrics: { tradingVolumeWei?: string | null };
}

export async function fetchGuilds(offset = 0, limit = 24): Promise<{ items: Guild[]; nextOffset: number | null }> {
  return vibeFetch(`/api/v1/chains/${CHAIN}/guilds?limit=${limit}&offset=${offset}`);
}
