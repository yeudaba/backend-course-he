import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createStampedeCache } = await load(import.meta.url, "P26-E13.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("תהליך אחד: 30 בקשות במקביל ← טעינה אחת", async (t) => {
  const { redis } = await redisSandbox(t);
  const cache = createStampedeCache(redis);
  let loads = 0;
  const loader = async () => { loads++; await sleep(100); return { top: [1, 2, 3] }; };
  const results = await Promise.all(Array.from({ length: 30 }, () => cache.get("home", 60, loader)));
  assert.equal(loads, 1);
  assert.ok(results.every((r) => r.top.length === 3));
});
test("שלושה שרתים: טעינה אחת, השאר מחכים לערך", async (t) => {
  const sb = await redisSandbox(t);
  const caches = [createStampedeCache(sb.redis), createStampedeCache(await sb.client()), createStampedeCache(await sb.client())];
  let loads = 0;
  const loader = async () => { loads++; await sleep(150); return 42; };
  const results = await Promise.all(Array.from({ length: 30 }, (_, i) => caches[i % 3].get("home", 60, loader)));
  assert.equal(loads, 1, "רק שרת אחד טוען — האחרים מחכים לערך ב־Redis");
  assert.ok(results.every((r) => r === 42));
  assert.equal(await sb.redis.exists("home:lock"), 0, "המנעול שוחרר");
});
test("הטוען נתקע — האחרים לא נתקעים לנצח", async (t) => {
  const sb = await redisSandbox(t);
  const a = createStampedeCache(sb.redis, { waitMs: 200 });
  const b = createStampedeCache(await sb.client(), { waitMs: 200 });
  const slow = a.get("k", 60, () => sleep(1000).then(() => "slow"));
  await sleep(30);
  const started = Date.now();
  assert.equal(await b.get("k", 60, async () => "fallback"), "fallback");
  assert.ok(Date.now() - started < 800, "אחרי waitMs — טוען בעצמו");
  await slow;
});
