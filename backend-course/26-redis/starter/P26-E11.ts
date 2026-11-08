// P26-E11: "צפית לאחרונה" עם list
import type { Redis } from "ioredis";

export async function viewed(redis: Redis, userId: number, productId: number, max = 10) {
  // כתוב כאן
}

export async function recent(redis: Redis, userId: number): Promise<number[]> {
  return []; // כתוב כאן
}
