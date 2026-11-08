// P26-E24: אתגר — "חם עכשיו" (חלון נע של צפיות)
import type { Redis } from "ioredis";

export async function recordView(redis: Redis, productId: number, now = Date.now()) {
  // כתוב כאן
}

export async function trending(redis: Redis, { windowMinutes, n, now = Date.now() }: { windowMinutes: number; n: number; now?: number }): Promise<{ productId: number; views: number }[]> {
  return []; // כתוב כאן
}
