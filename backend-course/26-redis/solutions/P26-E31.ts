// P26-E31 — sessions ב־Redis
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

export type Session = { userId: number; data: Record<string, string> };

const sessionKey = (id: string) => `session:${id}`;
const userKey = (userId: number) => `user:${userId}:sessions`;

export async function createSession(redis: Redis, userId: number, data: Record<string, string> = {}, ttlSec = 1800): Promise<string> {
  const id = randomUUID();
  await redis
    .multi()
    .hset(sessionKey(id), { ...data, userId: String(userId) })
    .expire(sessionKey(id), ttlSec)
    .sadd(userKey(userId), id)
    // הרשימה חיה כמו ה־session הארוך ביותר שבה: NX — אם אין לה עדיין תוקף, GT — רק להאריך
    .expire(userKey(userId), ttlSec, "NX")
    .expire(userKey(userId), ttlSec, "GT")
    .exec();
  return id;
}

export async function getSession(redis: Redis, id: string, ttlSec = 1800): Promise<Session | null> {
  const hash = await redis.hgetall(sessionKey(id));
  if (Object.keys(hash).length === 0) return null;
  const { userId, ...data } = hash;
  await redis.multi().expire(sessionKey(id), ttlSec).expire(userKey(Number(userId)), ttlSec, "GT").exec();
  return { userId: Number(userId), data };
}

export async function destroySession(redis: Redis, id: string): Promise<boolean> {
  const userId = await redis.hget(sessionKey(id), "userId");
  if (userId === null) return false;
  await redis.multi().del(sessionKey(id)).srem(userKey(Number(userId)), id).exec();
  return true;
}

export async function destroyAllForUser(redis: Redis, userId: number): Promise<number> {
  const ids = await redis.smembers(userKey(userId));
  const deleted = ids.length > 0 ? await redis.del(...ids.map(sessionKey)) : 0;
  await redis.del(userKey(userId));
  return deleted;
}
