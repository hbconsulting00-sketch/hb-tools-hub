import { Redis } from "@upstash/redis";

export function getRedis(): Redis | null {
  // Upstash marketplace uses these names
  const url   = process.env.UPSTASH_REDIS_REST_URL
             ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
             ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function getRedisDebug(): string {
  return JSON.stringify({
    UPSTASH_REDIS_REST_URL:   !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    KV_REST_API_URL:          !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN:        !!process.env.KV_REST_API_TOKEN,
  });
}

export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    const val = await client.get<unknown>(key);
    if (val === null || val === undefined) return null;
    return (typeof val === "string" ? JSON.parse(val) : val) as T;
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: unknown): Promise<boolean> {
  try {
    const client = getRedis();
    if (!client) return false;
    await client.set(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
