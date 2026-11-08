import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { viewed, recent } = await load(import.meta.url, "P26-E11.ts");

test("הכי חדש ראשון, בלי כפילויות, עד max", async (t) => {
  const { redis } = await redisSandbox(t);
  for (const p of [1, 2, 3]) await viewed(redis, 7, p);
  assert.deepEqual(await recent(redis, 7), [3, 2, 1]);
  await viewed(redis, 7, 1);
  assert.deepEqual(await recent(redis, 7), [1, 3, 2], "צפייה חוזרת — עולה לראש, לא כפולה");
  for (let p = 10; p < 20; p++) await viewed(redis, 7, p, 5);
  assert.deepEqual(await recent(redis, 7), [19, 18, 17, 16, 15], "חסום ל־max");
  assert.deepEqual(await recent(redis, 8), [], "משתמש אחר");
  const ttl = await redis.ttl("recent:7");
  assert.ok(ttl > 29 * 86400, "תוקף 30 יום, מתחדש בכל צפייה");
});
