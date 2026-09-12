import assert from "node:assert/strict";
import { test } from "node:test";

import { createMemoryFaqCache } from "@/lib/ai/faq-cache";
import { buildYearlyEstimate, LIVING_MONTHS } from "@/lib/costs/estimate";
import {
  FALLBACK_BDT_RATES,
  FX_CACHE_KEY,
  FX_CACHE_TTL_SECONDS,
  FX_FEED_URL,
  loadBdtRates,
  ratesFromUsdQuote,
  toBdt,
} from "@/lib/fx/load-rates";

const chinaRows = [
  {
    category: "tuition" as const,
    monthlyAmount: "22000.00",
    currency: "CNY" as const,
  },
  {
    category: "accommodation" as const,
    monthlyAmount: "1800.00",
    currency: "CNY" as const,
  },
  {
    category: "food" as const,
    monthlyAmount: "1500.00",
    currency: "CNY" as const,
  },
  {
    category: "transport" as const,
    monthlyAmount: "250.00",
    currency: "CNY" as const,
  },
  {
    category: "misc" as const,
    monthlyAmount: "500.00",
    currency: "CNY" as const,
  },
];

const rates = { CNY: 16, INR: 1.4, MYR: 27, KRW: 0.09 };

test("destination estimate uses generic tuition plus 12 months of living", () => {
  const result = buildYearlyEstimate({
    destination: "china",
    rows: chinaRows,
    program: null,
    rates,
  });

  const livingMonthly = 1800 + 1500 + 250 + 500;
  assert.equal(result.tuitionSource, "estimate");
  assert.equal(result.tuition?.yearlyLocal, 22000);
  assert.equal(result.livingYearlyLocal, livingMonthly * LIVING_MONTHS);
  assert.equal(result.headlineLocal, 22000 + livingMonthly * LIVING_MONTHS);
  assert.equal(result.headlineLocalCurrency, "CNY");
  assert.equal(result.headlineBdt, result.headlineLocal * rates.CNY);
  assert.equal(result.living.length, 4);
});

test("a published program replaces the generic tuition figure", () => {
  const result = buildYearlyEstimate({
    destination: "china",
    rows: chinaRows,
    program: {
      id: "11111111-1111-4111-8111-111111111111",
      universityName: "Example University",
      field: "Computer Science",
      tuitionAmount: "31400.00",
      tuitionCurrency: "CNY",
    },
    rates,
  });

  assert.equal(result.tuitionSource, "program");
  assert.equal(result.tuition?.yearlyLocal, 31400);
  assert.equal(result.tuition?.source, "program");
  assert.match(result.programLabel ?? "", /Example University/);
  assert.equal(result.livingYearlyLocal, (1800 + 1500 + 250 + 500) * 12);
  assert.equal(result.headlineLocal, 31400 + (1800 + 1500 + 250 + 500) * 12);
});

test("toBdt multiplies by the cached rate", () => {
  assert.equal(toBdt(100, "CNY", rates), 1600);
});

test("ratesFromUsdQuote converts via USD into BDT per local unit", () => {
  const converted = ratesFromUsdQuote({
    USD: 1,
    BDT: 120,
    CNY: 8,
    INR: 80,
    MYR: 4,
    KRW: 1200,
  });
  assert.ok(converted);
  assert.equal(converted.CNY, 15);
  assert.equal(converted.INR, 1.5);
  assert.equal(converted.MYR, 30);
  assert.equal(converted.KRW, 0.1);
});

test("the FX feed is called once when the same rates are requested twice", async () => {
  const cache = createMemoryFaqCache();
  let fetches = 0;

  const fetchFn: typeof fetch = async (url) => {
    fetches += 1;
    assert.equal(String(url), FX_FEED_URL);
    return new Response(
      JSON.stringify({
        result: "success",
        rates: {
          USD: 1,
          BDT: 120,
          CNY: 8,
          INR: 80,
          MYR: 4,
          KRW: 1200,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const first = await loadBdtRates({ fetch: fetchFn, cache });
  const second = await loadBdtRates({ fetch: fetchFn, cache });

  assert.equal(fetches, 1);
  assert.equal(first.source, "live");
  assert.equal(second.source, "live");
  assert.equal(first.CNY, second.CNY);
  assert.equal(FX_CACHE_TTL_SECONDS, 60 * 60 * 24);
  assert.equal(FX_CACHE_KEY, "fx:bdt:v1");
});

test("a failed FX feed falls back without throwing", async () => {
  const cache = createMemoryFaqCache();
  const ratesResult = await loadBdtRates({
    fetch: async () => new Response("nope", { status: 500 }),
    cache,
  });

  assert.equal(ratesResult.source, "fallback");
  assert.equal(ratesResult.CNY, FALLBACK_BDT_RATES.CNY);
});
