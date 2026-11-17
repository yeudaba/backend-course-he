// P26-E79: תור פשוט מ־list
import type { Redis } from "ioredis";

export async function enqueue(redis: Redis, queue: string, job: unknown) {
  return redis.rpush(`q:${queue}`, JSON.stringify(job));
}

export async function drain(redis: Redis, queue: string, handler: (job: any) => Promise<void>) {
  let done = 0, failed = 0;
  for (let raw = await redis.lpop(`q:${queue}`); raw !== null; raw = await redis.lpop(`q:${queue}`)) {
    const job = JSON.parse(raw);
    try {
      await handler(job);
      done++;
    } catch (e) {
      failed++;
      await redis.rpush(`q:${queue}:failed`, JSON.stringify({ job, error: (e as Error).message }));
    }
  }
  return { done, failed };
}
