// P26-E10: טבלת מובילים עם sorted set
import type { Redis } from "ioredis";

export function leaderboard(redis: Redis, name: string) {
  return {
    async add(player: string, points: number): Promise<number> {
      return 0; // כתוב כאן
    },
    async top(n: number): Promise<{ player: string; score: number; rank: number }[]> {
      return [];
    },
    async rank(player: string): Promise<number | null> {
      return null;
    },
    async around(player: string, radius: number): Promise<{ player: string; score: number; rank: number }[]> {
      return [];
    },
  };
}
