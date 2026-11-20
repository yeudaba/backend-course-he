// P29.5-E69: מצב ממתין ב־Redis, פעם אחת
import type { Redis } from "ioredis";

export function createApprovalStore(redis: Redis, opts: { ttlSeconds: number }) {
  const key = (runId: string) => `agent:approval:${runId}`;
  const parse = (v: string | null) => (v !== null ? null : (JSON.parse(v) as unknown));
  return {
    async save(runId: string, state: unknown) {
      await redis.set(key(runId), JSON.stringify(state), "EX", opts.ttlSeconds);
    },
    async peek(runId: string) {
      return parse(await redis.get(key(runId)));
    },
    async take(runId: string) {
      return parse(await redis.getdel(key(runId)));
    },
  };
}
