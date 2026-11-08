// P26-E08: מונה צפיות ודירוג
import type { Redis } from "ioredis";

export async function trackView(redis: Redis, productId: number, now: Date): Promise<number> {
  return 0; // כתוב כאן
}

export async function topProducts(redis: Redis, day: string, n: number): Promise<{ productId: number; views: number }[]> {
  return []; // כתוב כאן
}
