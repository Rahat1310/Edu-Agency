import { createHash } from "node:crypto";

import { Redis } from "@upstash/redis";

import type { Locale } from "@/lib/i18n/config";

export const FAQ_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const FAQ_CACHE_KEY_PREFIX = "ai:faq:v1";

export type FaqCache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

function hasRedisEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export function faqCacheKey(
  locale: Locale,
  normalizedQuestion: string,
): string {
  const hash = createHash("sha256").update(normalizedQuestion).digest("hex");
  return `${FAQ_CACHE_KEY_PREFIX}:${locale}:${hash}`;
}

export function createMemoryFaqCache(
  store: Map<string, MemoryEntry> = new Map(),
): FaqCache {
  return {
    async get(key) {
      const entry = store.get(key);
      if (!entry) {
        return null;
      }
      if (entry.expiresAt <= Date.now()) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key, value, ttlSeconds) {
      store.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    },
  };
}

let redis: Redis | undefined;
let singleton: FaqCache | undefined;

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

function createRedisBackedCache(memory: FaqCache): FaqCache {
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
        await memory.set(key, serialized, FAQ_CACHE_TTL_SECONDS);
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
        // Process-local cache still holds the answer for this instance.
      }
    },
  };
}

/**
 * Redis when Upstash is configured; otherwise process-local memory
 * (local/dev and tests). Not a production substitute on serverless.
 */
export function getFaqCache(): FaqCache {
  if (singleton) {
    return singleton;
  }

  const memory = createMemoryFaqCache();
  singleton = hasRedisEnv() ? createRedisBackedCache(memory) : memory;
  return singleton;
}
