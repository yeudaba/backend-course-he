// P26-E121: לוח דירוג — כל משחק מאפס, top(3) מחזיר ארבעה חלשים, והמנצח במקום 0.
// addPoints ← מוסיפה ומחזירה ניקוד · top(n) ← [{ user, score }] מהגבוה · rankOf ← מקום מ־1, או null
//
// בדיקה:  npm run check P26-E121
import type { Redis } from "ioredis";

export async function addPoints(redis: Redis, board: string, user: string, points: number): Promise<number> {
  await redis.zadd(`board:${board}`, points, user);
  return Number(await redis.zscore(`board:${board}`, user));
}

export async function top(redis: Redis, board: string, n: number) {
  const flat = await redis.zrange(`board:${board}`, 0, n, "WITHSCORES");
  const out: { user: string; score: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push({ user: flat[i], score: Number(flat[i + 1]) });
  return out;
}

export async function rankOf(redis: Redis, board: string, user: string): Promise<number | null> {
  return redis.zrank(`board:${board}`, user);
}
