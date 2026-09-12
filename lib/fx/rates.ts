import { Redis } from "@upstash/redis";
import { unstable_cache } from "next/cache";

import { createMemoryFaqCache, type FaqCache } from "@/lib/ai/faq-cache";
import {
  FX_CACHE_TAG,
  FX_CACHE_TTL_SECONDS,
  loadBdtRates,
  type BdtRates,
  type FxCache,
} from "@/lib/fx/load-rates";

export {
  FX_CACHE_TAG,
  FX_CACHE_TTL_SECONDS,
  toBdt,
  type BdtRates,
} from "@/lib/fx/load-rates";

let redis: Redis | undefined;
let singleton: FxCache | undefined;

function hasRedisEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getRedis(): Redis {
  if (redis) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error("Upstash Redis is not configured.");
  }

  redis = new Redis({ url, token });
  return redis;
}

function createRedisBackedCache(memory: FaqCache): FxCache {
  return {
    async get(key) {
      const local = await memory.get(key);
      if (local) {
        return local;
      }

      try {
        const value = await getRedis().get(key);
        if (value == null) {
          return null;
        }
        const serialized =
          typeof value === "string" ? value : JSON.stringify(value);
        await memory.set(key, serialized, FX_CACHE_TTL_SECONDS);
        return serialized;
      } catch {
        return null;
      }
    },
    async set(key, value, ttlSeconds) {
      await memory.set(key, value, ttlSeconds);
      try {
        await getRedis().set(key, value, { ex: ttlSeconds });
      } catch {
        // Process-local cache still holds the quote for this instance.
      }
    },
  };
}

function getFxCache(): FxCache {
  if (singleton) {
    return singleton;
  }

  const memory = createMemoryFaqCache();
  singleton = hasRedisEnv() ? createRedisBackedCache(memory) : memory;
  return singleton;
}

/**
 * Shared daily quote. Next's data cache plus Redis/memory mean the FX
 * feed is not contacted on every calculator render.
 */
export function getBdtRates(): Promise<BdtRates> {
  return unstable_cache(
    () =>
      loadBdtRates({
        fetch: globalThis.fetch.bind(globalThis),
        cache: getFxCache(),
      }),
    ["bdt-fx-rates"],
    {
      revalidate: FX_CACHE_TTL_SECONDS,
      tags: [FX_CACHE_TAG],
    },
  )();
}
