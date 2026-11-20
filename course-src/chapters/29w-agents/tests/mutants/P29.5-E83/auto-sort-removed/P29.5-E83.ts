// P29.5-E83: מצב של ריצות ב־Redis
import type { Redis } from "ioredis";

type Status = "running" | "waiting" | "done";
const RUNNING = "agent:runs:running";

export function createRunStore(redis: Redis, opts: { ttlSeconds: number }) {
  const key = (runId: string) => `agent:run:${runId}`;
  return {
    async save(runId: string, state: unknown, status: Status) {
      const m = redis.multi().set(key(runId), JSON.stringify(state), "EX", opts.ttlSeconds);
      if (status === "running") m.sadd(RUNNING, runId);
      else m.srem(RUNNING, runId);
      await m.exec();
    },
    async load(runId: string) {
      const v = await redis.get(key(runId));
      return v === null ? null : (JSON.parse(v) as unknown);
    },
    async running() {
      return (await redis.smembers(RUNNING));
    },
    async remove(runId: string) {
      await redis.multi().del(key(runId)).srem(RUNNING, runId).exec();
    },
  };
}
