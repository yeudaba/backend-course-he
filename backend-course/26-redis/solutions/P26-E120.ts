// P26-E120: Last-Event-ID בין שרתים — מאגר ב־Redis
import type { Redis } from "ioredis";

export async function appendEvent(redis: Redis, stream: string, event: string, data: unknown, max = 100) {
  const id = await redis.incr(`sse:${stream}:seq`);
  const log = `sse:${stream}:log`;
  await redis.multi().rpush(log, JSON.stringify({ id, event, data })).ltrim(log, -max, -1).exec();
  return id;
}

export async function eventsAfter(redis: Redis, stream: string, lastId: number) {
  const all = (await redis.lrange(`sse:${stream}:log`, 0, -1)).map((x) => JSON.parse(x) as { id: number; event: string; data: unknown });
  return all.filter((e) => e.id > lastId).sort((a, b) => a.id - b.id);
}
