import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Upstash Redis not configured, caching disabled");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const client = getRedis();

  if (client) {
    try {
      const hit = await client.get<T>(key);
      if (hit !== null && hit !== undefined) {
        return hit;
      }
    } catch (e) {
      console.warn("Redis get error:", e);
    }
  }

  const result = await fetcher();

  if (client) {
    try {
      await client.set(key, JSON.stringify(result), { ex: ttlSeconds });
    } catch (e) {
      console.warn("Redis set error:", e);
    }
  }

  return result;
}

export async function invalidate(key: string): Promise<void> {
  const client = getRedis();
  if (client) {
    await client.del(key);
  }
}

// Cache TTL constants
export const CACHE_TTL = {
  PRODUCT: 3600,        // 1 hour
  SEARCH: 1800,         // 30 minutes
  MATCH: 7200,          // 2 hours
  INSIGHTS: 86400,      // 24 hours
} as const;
