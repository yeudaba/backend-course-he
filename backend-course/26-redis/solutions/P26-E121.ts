// P26-E121: לוח דירוג — מתוקן
import type { Redis } from "ioredis";

export async function addPoints(redis: Redis, board: string, user: string, points: number): Promise<number> {
  return Number(await redis.zincrby(`board:${board}`, points, user));
}

export async function top(redis: Redis, board: string, n: number) {
  const flat = await redis.zrange(`board:${board}`, 0, n - 1, "REV", "WITHSCORES");
  const out: { user: string; score: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push({ user: flat[i], score: Number(flat[i + 1]) });
  return out;
}

export async function rankOf(redis: Redis, board: string, user: string): Promise<number | null> {
  const r = await redis.zrevrank(`board:${board}`, user);
  return r === null ? null : r + 1;
}
