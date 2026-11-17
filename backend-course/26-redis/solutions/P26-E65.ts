// P26-E65: לייק פעם אחת, עם Lua
import type { Redis } from "ioredis";

const LIKE = `if redis.call("SADD", KEYS[1], ARGV[1]) == 1 then return redis.call("INCR", KEYS[2]) end
return -1`;
const UNLIKE = `if redis.call("SREM", KEYS[1], ARGV[1]) == 1 then return redis.call("DECR", KEYS[2]) end
return -1`;

const keys = (postId: number) => [`likes:${postId}`, `likes:${postId}:count`];

export async function like(redis: Redis, postId: number, userId: number) {
  return Number(await redis.eval(LIKE, 2, ...keys(postId), String(userId)));
}

export async function unlike(redis: Redis, postId: number, userId: number) {
  return Number(await redis.eval(UNLIKE, 2, ...keys(postId), String(userId)));
}

export async function likeCount(redis: Redis, postId: number) {
  return Number((await redis.get(`likes:${postId}:count`)) ?? 0);
}
