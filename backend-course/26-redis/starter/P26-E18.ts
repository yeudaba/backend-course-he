// P26-E18: צרכן idempotent
import type { Redis } from "ioredis";

export async function processOnce<T>(redis: Redis, messageId: string, ttlSeconds: number, handler: () => Promise<T>): Promise<{ processed: boolean; result?: T }> {
  return { processed: true, result: await handler() }; // כתוב כאן
}
