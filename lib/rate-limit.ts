import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Named sliding-window limits. Add a key here when a new use case needs
 * its own budget — callers only pass the name and an identifier.
 */
export const rateLimitConfigs = {
  "lead-form": { requests: 5, window: "1 h" },
  chat: { requests: 30, window: "1 h" },
  "eligibility-quiz": { requests: 5, window: "10 m" },
  contact: { requests: 5, window: "10 m" },
  "portal-phone": { requests: 10, window: "1 h" },
  "match-refresh": { requests: 8, window: "1 h" },
  "document-upload": { requests: 20, window: "1 h" },
  "document-view": { requests: 60, window: "1 h" },
  "document-counselor-view": { requests: 120, window: "1 h" },
  api: { requests: 60, window: "1 m" },
} as const;

export type RateLimitName = keyof typeof rateLimitConfigs;

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let redis: Redis | undefined;
const limiters = new Map<RateLimitName, Ratelimit>();
const memoryHits = new Map<string, number[]>();

function hasRedisEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function windowToMs(window: string): number {
  const [amountRaw, unit] = window.split(" ");
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || !unit) {
    return 60 * 60 * 1000;
  }

  switch (unit) {
    case "ms":
      return amount;
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000;
  }
}

/**
 * Process-local sliding window used when Upstash is not configured
 * (local/dev) or when Redis is unreachable. Not a production substitute
 * on serverless — each instance has its own map.
 */
function memoryLimit(name: RateLimitName, identifier: string): RateLimitResult {
  const config = rateLimitConfigs[name];
  const windowMs = windowToMs(config.window);
  const key = `${name}:${identifier}`;
  const now = Date.now();
  const recent = (memoryHits.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (recent.length >= config.requests) {
    const oldest = recent[0] ?? now;
    return {
      allowed: false,
      limit: config.requests,
      remaining: 0,
      reset: oldest + windowMs,
    };
  }

  recent.push(now);
  memoryHits.set(key, recent);

  return {
    allowed: true,
    limit: config.requests,
    remaining: config.requests - recent.length,
    reset: now + windowMs,
  };
}

function getRedis(): Redis {
  if (redis) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error(
      "Missing or invalid environment variables: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN. Add them to .env.local (see .env.example).",
    );
  }

  redis = new Redis({ url, token });
  return redis;
}

function getLimiter(name: RateLimitName): Ratelimit {
  const existing = limiters.get(name);

  if (existing) {
    return existing;
  }

  const config = rateLimitConfigs[name];
  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `ratelimit:${name}`,
    analytics: false,
  });

  limiters.set(name, limiter);
  return limiter;
}

export async function rateLimit(
  name: RateLimitName,
  identifier: string,
): Promise<RateLimitResult> {
  if (hasRedisEnv()) {
    try {
      const result = await getLimiter(name).limit(identifier);

      return {
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch {
      return memoryLimit(name, identifier);
    }
  }

  return memoryLimit(name, identifier);
}
