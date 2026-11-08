import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { slidingHit } = await load(import.meta.url, "P26-E15.ts");

test("חלון נע", async (t) => {
  const { redis } = await redisSandbox(t);
  const T = 1_000_000_000;
  const o = (now) => ({ limit: 3, windowMs: 10_000, now });
  assert.deepEqual(await slidingHit(redis, "u", o(T)), { allowed: true, remaining: 2, retryAfterSeconds: 0 });
  await slidingHit(redis, "u", o(T + 4000));
  await slidingHit(redis, "u", o(T + 6000));
  assert.deepEqual(await slidingHit(redis, "u", o(T + 7000)), { allowed: false, remaining: 0, retryAfterSeconds: 3 });
  for (let i = 0; i < 5; i++) assert.equal((await slidingHit(redis, "u", o(T + 7500))).allowed, false, "נדחות לא נספרות");
  assert.equal((await slidingHit(redis, "u", o(T + 10_000))).allowed, true, "הראשונה יצאה מהחלון");
  assert.equal((await slidingHit(redis, "u", o(T + 10_001))).allowed, false);
  assert.equal((await slidingHit(redis, "other", o(T + 7000))).allowed, true);
});
test("שתי בקשות באותה מילישנייה — שתיהן נספרות", async (t) => {
  const { redis } = await redisSandbox(t);
  const o = { limit: 2, windowMs: 10_000, now: 5_000_000 };
  await slidingHit(redis, "u", o);
  await slidingHit(redis, "u", o);
  assert.equal((await slidingHit(redis, "u", o)).allowed, false, "ZADD עם אותו member — דורס! צריך member ייחודי");
});
test("המפתח מת לבד", async (t) => {
  const { redis } = await redisSandbox(t);
  await slidingHit(redis, "u", { limit: 3, windowMs: 2000 });
  const pttl = await redis.pttl("sw:u");
  assert.ok(pttl > 0 && pttl <= 2000, `PEXPIRE (${pttl})`);
});
