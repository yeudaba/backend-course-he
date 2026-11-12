// P26-E37: עגלת קניות ב־hash
import type { Redis } from "ioredis";

const WEEK = 7 * 86400;
const key = (userId: number) => `cart:${userId}`;

export async function addToCart(redis: Redis, userId: number, productId: number, qty: number) {
  const [[, n]] = (await redis.multi().hincrby(key(userId), String(productId), qty).expire(key(userId), WEEK).exec()) as [Error | null, number][];
  if (n <= 0) {
    await redis.hdel(key(userId), String(productId));
    return 0;
  }
  return n;
}

export async function getCart(redis: Redis, userId: number) {
  const h = await redis.hgetall(key(userId));
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k, Number(v)]));
}

export async function clearCart(redis: Redis, userId: number) {
  return (await redis.del(key(userId))) === 1;
}
