import type { TuitionCurrency } from "@/db/schema";

export const FX_CACHE_TTL_SECONDS = 60 * 60 * 24;
export const FX_CACHE_KEY = "fx:bdt:v1";
export const FX_CACHE_TAG = "fx-rates";

/** Used when the public feed is unreachable. Not a bank selling rate. */
export const FALLBACK_BDT_RATES: Record<TuitionCurrency, number> = {
  CNY: 16.8,
  INR: 1.42,
  MYR: 27.4,
  KRW: 0.09,
};

export const FX_FEED_URL = "https://open.er-api.com/v6/latest/USD";

export type BdtRates = Record<TuitionCurrency, number> & {
  fetchedAt: string;
  source: "live" | "fallback";
};

export type FxCache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

export function toBdt(
  amount: number,
  currency: TuitionCurrency,
  rates: Pick<BdtRates, TuitionCurrency>,
): number {
  const rate = rates[currency];
  if (!Number.isFinite(rate) || rate <= 0) {
    return 0;
  }
  return amount * rate;
}

function positiveNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

export function ratesFromUsdQuote(
  usdRates: Record<string, number>,
): Record<TuitionCurrency, number> | null {
  const bdt = positiveNumber(usdRates.BDT);
  const cny = positiveNumber(usdRates.CNY);
  const inr = positiveNumber(usdRates.INR);
  const myr = positiveNumber(usdRates.MYR);
  const krw = positiveNumber(usdRates.KRW);

  if (!bdt || !cny || !inr || !myr || !krw) {
    return null;
  }

  return {
    CNY: bdt / cny,
    INR: bdt / inr,
    MYR: bdt / myr,
    KRW: bdt / krw,
  };
}

function parseCachedRates(raw: string): BdtRates | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") {
      return null;
    }
    const record = data as Record<string, unknown>;
    const cny = positiveNumber(record.CNY);
    const inr = positiveNumber(record.INR);
    const myr = positiveNumber(record.MYR);
    const krw = positiveNumber(record.KRW);
    if (!cny || !inr || !myr || !krw) {
      return null;
    }
    if (record.source !== "live" && record.source !== "fallback") {
      return null;
    }
    if (typeof record.fetchedAt !== "string") {
      return null;
    }
    return {
      CNY: cny,
      INR: inr,
      MYR: myr,
      KRW: krw,
      fetchedAt: record.fetchedAt,
      source: record.source,
    };
  } catch {
    return null;
  }
}

function fallbackRates(): BdtRates {
  return {
    ...FALLBACK_BDT_RATES,
    fetchedAt: new Date().toISOString(),
    source: "fallback",
  };
}

async function fetchLiveRates(fetchFn: typeof fetch): Promise<BdtRates | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetchFn(FX_FEED_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (body.result !== "success" || !body.rates) {
      return null;
    }
    const converted = ratesFromUsdQuote(body.rates);
    if (!converted) {
      return null;
    }
    return {
      ...converted,
      fetchedAt: new Date().toISOString(),
      source: "live",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Daily FX quote for local currency → BDT. Cache hit never calls the feed.
 */
export async function loadBdtRates(deps: {
  fetch: typeof fetch;
  cache: FxCache;
}): Promise<BdtRates> {
  const hit = await deps.cache.get(FX_CACHE_KEY);
  if (hit) {
    const parsed = parseCachedRates(hit);
    if (parsed) {
      return parsed;
    }
  }

  const live = await fetchLiveRates(deps.fetch);
  const rates = live ?? fallbackRates();
  const ttl = rates.source === "live" ? FX_CACHE_TTL_SECONDS : 15 * 60;

  await deps.cache.set(FX_CACHE_KEY, JSON.stringify(rates), ttl);
  return rates;
}
