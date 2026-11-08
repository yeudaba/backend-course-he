import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { allow } = await load(import.meta.url, "P26-E21.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("לכל לקוח בנפרד", async (t) => {
  const { redis } = await redisSandbox(t);
  for (let i = 0; i < 3; i++) await allow(redis, "a", 3, 60);
  assert.equal(await allow(redis, "a", 3, 60), false);
  assert.equal(await allow(redis, "b", 3, 60), true, "לקוח b לא נחסם בגלל a");
});
test("במקביל — לא יותר מה־limit", async (t) => {
  const sb = await redisSandbox(t);
  const other = await sb.client();
  const r = await Promise.all(Array.from({ length: 30 }, (_, i) => allow(i % 2 ? sb.redis : other, "a", 10, 60)));
  assert.equal(r.filter(Boolean).length, 10);
});
test("החלון נגמר גם למי שממשיך לשלוח", async (t) => {
  const { redis } = await redisSandbox(t);
  for (let i = 0; i < 3; i++) await allow(redis, "a", 2, 2);
  await sleep(1200);
  await allow(redis, "a", 2, 2);
  await sleep(1000);
  assert.equal(await allow(redis, "a", 2, 2), true, "אחרי 2.2 שניות — חלון חדש, למרות שהמשיך לשלוח באמצע");
});
