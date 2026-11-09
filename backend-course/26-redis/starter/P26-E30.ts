// P26-E30: fan-out בין שרתים דרך Redis pub/sub
import type { Redis } from "ioredis";

export async function createRelay({ pub, sub, channel }: { pub: Redis; sub: Redis; channel: string }) {
  return {
    publish: async (data: unknown) => {}, // כתוב כאן
    subscribe(listener: (data: unknown) => void) {
      return () => {};
    },
    async close() {},
  };
}
