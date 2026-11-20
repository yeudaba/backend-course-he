// P26-E92: חיבור Redis — או null
import { Redis } from "ioredis";

export function createRedisOrNull(url: string | undefined, prefix: string): Redis | null {

  return new Redis(url, { keyPrefix: `${prefix}:`, maxRetriesPerRequest: 2, enableOfflineQueue: false });
}
