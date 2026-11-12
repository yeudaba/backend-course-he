// P26-E53: רענון מוקדם ברקע
import type { Redis } from "ioredis";

export async function getWithEarlyRefresh<T>(redis: Redis, key: string, ttl: number, load: () => Promise<T>, refreshBelow: number): Promise<T> {
  const res = await redis.multi().get(key).ttl(key).exec();
  const hit = res![0][1] as string | null;
  const left = res![1][1] as number;
  if (hit === null) {
    const value = await load();
    await redis.set(key, JSON.stringify(value), "EX", ttl);
    return value;
  }
  if (left >= 0 && left < refreshBelow) void refresh(redis, key, ttl, load);
  return JSON.parse(hit) as T;
}

async function refresh<T>(redis: Redis, key: string, ttl: number, load: () => Promise<T>) {
  const lock = `${key}:refresh`;
  if ((await redis.set(lock, "1", "EX", 10, "NX")) !== "OK") return; // מישהו אחר כבר מרענן
  try {
    const value = await load();
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // הערך הישן נשאר עד שיפוג; הבקשה הבאה תנסה שוב
  } finally {
    await redis.del(lock).catch(() => {});
  }
}
