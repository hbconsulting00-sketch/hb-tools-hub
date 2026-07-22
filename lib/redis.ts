import { Redis } from "@upstash/redis";

export function getRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    const val = await client.get<string>(key);
    if (!val) return null;
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
