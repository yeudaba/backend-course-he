// P26-E58: HIT ו־MISS מחזירים אותו דבר — גם תאריכים
import type { Redis } from "ioredis";

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const revive = (_key: string, value: unknown) => (typeof value === "string" && ISO.test(value) ? new Date(value) : value);

export async function getOrSetDates<T>(redis: Redis, key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = await redis.get(key);
  if (hit !== null) return JSON.parse(hit, revive) as T;
  const value = await load();
  await redis.set(key, JSON.stringify(value), "EX", ttl);
  return value;
}
