import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { like, unlike, likeCount } = await load(import.meta.url, "P26-E65.ts");

test("לייק, לייק כפול, unlike", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  assert.equal(await likeCount(redis, 1), 0);
  assert.equal(await like(redis, 1, 7), 1);
  assert.equal(await like(redis, 1, 7), -1, "לייק כפול");
  assert.equal(await like(redis, 1, 8), 2);
  assert.equal(await likeCount(redis, 1), 2);
  assert.equal(await unlike(redis, 1, 9), -1, "לא עשה לייק");
  assert.equal(await unlike(redis, 1, 7), 1);
  assert.equal(await likeCount(redis, 1), 1);
  assert.equal(await raw.type(`${prefix}likes:1`), "set");
  assert.equal(await raw.get(`${prefix}likes:1:count`), "1");
  assert.equal(await likeCount(redis, 2), 0, "פוסט אחר");
});
test("במקביל משני שרתים — המונה תמיד שווה לגודל הקבוצה", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  const ops = [];
  for (let i = 0; i < 200; i++) {
    const c = i % 2 ? second : sb.redis;
    const user = i % 7;
    ops.push(i % 3 === 0 ? unlike(c, 5, user) : like(c, 5, user));
  }
  await Promise.all(ops);
  assert.equal(await likeCount(sb.redis, 5), await sb.raw.scard(`${sb.prefix}likes:5`));
  await Promise.all(Array.from({ length: 50 }, (_, i) => like(i % 2 ? second : sb.redis, 6, 1)));
  assert.equal(await likeCount(sb.redis, 6), 1, "50 לייקים של אותו משתמש — אחד");
});
