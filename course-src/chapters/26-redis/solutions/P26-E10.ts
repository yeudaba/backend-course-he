// P26-E10
import type { Redis } from "ioredis";

// טבלת מובילים: sorted set — Redis שומר ממוין לפי score, וכל פעולה ב־O(log n)
export function leaderboard(redis: Redis, name: string) {
  const key = `lb:${name}`;
  return {
    add: (player: string, points: number) => redis.zincrby(key, points, player).then(Number),
    async top(n: number) {
      const flat = await redis.zrevrange(key, 0, n - 1, "WITHSCORES");
      return Array.from({ length: flat.length / 2 }, (_, i) => ({ player: flat[2 * i], score: Number(flat[2 * i + 1]), rank: i + 1 }));
    },
    // מקום (מ־1), או null
    async rank(player: string) {
      const r = await redis.zrevrank(key, player);
      return r === null ? null : r + 1;
    },
    async around(player: string, radius: number) {
      const r = await redis.zrevrank(key, player);
      if (r === null) return [];
      const start = Math.max(0, r - radius);
      const flat = await redis.zrevrange(key, start, r + radius, "WITHSCORES");
      return Array.from({ length: flat.length / 2 }, (_, i) => ({ player: flat[2 * i], score: Number(flat[2 * i + 1]), rank: start + i + 1 }));
    },
  };
}
