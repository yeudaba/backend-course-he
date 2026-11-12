// P26-E38: סקר — הצבעה אחת למשתמש
import type { Redis } from "ioredis";

export async function vote(redis: Redis, pollId: string, userId: number, option: string) {
  const added = await redis.sadd(`poll:${pollId}:voters`, String(userId));
  if (added === 0) return false;
  await redis.hincrby(`poll:${pollId}:results`, option, 1);
  return true;
}

export async function results(redis: Redis, pollId: string) {
  const h = await redis.hgetall(`poll:${pollId}:results`);
  return Object.entries(h)
    .map(([option, v]) => ({ option, votes: Number(v) }))
    .sort((a, b) => b.votes - a.votes || a.option.localeCompare(b.option));
}
