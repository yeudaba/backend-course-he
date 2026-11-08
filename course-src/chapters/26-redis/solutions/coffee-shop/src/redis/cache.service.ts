import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Redis } from "ioredis";
import { REDIS } from "./redis.tokens";

export type CacheStatus = "HIT" | "MISS" | "OFF";

// cache-aside עם "גרסה" לכל קבוצת מפתחות: במקום למחוק את כל הוריאציות (q=, page=, sort=…),
// מעלים את הגרסה — והמפתחות הישנים פשוט לא נקראים יותר ומתים ב־TTL
@Injectable()
export class CacheService {
  private readonly logger = new Logger("CacheService");

  constructor(@Inject(REDIS) private readonly redis: Redis | null) {}

  async getOrSet<T>(group: string, key: string, ttlSeconds: number, load: () => Promise<T>): Promise<{ value: T; status: CacheStatus }> {
    if (!this.redis) return { value: await load(), status: "OFF" };
    let fullKey: string | null = null;
    try {
      const version = (await this.redis.get(`v:${group}`)) ?? "0";
      fullKey = `cache:${group}:${version}:${key}`;
      const hit = await this.redis.get(fullKey);
      if (hit !== null) return { value: JSON.parse(hit) as T, status: "HIT" };
    } catch (err) {
      // Redis נפל? לא מפילים את הבקשה — cache הוא אופטימיזציה, לא מקור אמת
      this.logger.warn(`cache read failed: ${(err as Error).message}`);
      return { value: await load(), status: "OFF" };
    }
    const value = await load();
    await this.redis.set(fullKey, JSON.stringify(value), "EX", ttlSeconds).catch((err: Error) => this.logger.warn(`cache write failed: ${err.message}`));
    return { value, status: "MISS" };
  }

  async invalidate(group: string) {
    await this.redis?.incr(`v:${group}`).catch((err: Error) => this.logger.warn(`cache invalidate failed: ${err.message}`));
  }
}
