import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { recordView, trending } = await load(import.meta.url, "P26-E24.ts");
const T = Date.parse("2026-11-08T10:00:30Z");
const min = (k) => T + k * 60_000;

test("חלון נע של דקות", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  // [מוצר, דקה]
  const views = [[1, 0], [1, 0], [2, 0], [2, 3], [2, 4], [3, 4], [3, 4], [3, 4], [3, 4], [1, 9], [1, 9], [3, 9]];
  for (const [p, m] of views) await recordView(redis, p, min(m));
  const pairs = (list) => list.map((x) => [x.productId, x.views]);
  assert.deepEqual(pairs(await trending(redis, { windowMinutes: 10, n: 2, now: min(9) })), [[3, 5], [1, 4]], "10 דקות (0–9): 3←5, 1←4, 2←3");
  const six = Object.fromEntries(pairs(await trending(redis, { windowMinutes: 6, n: 5, now: min(9) })));
  assert.deepEqual(six, { 3: 5, 1: 2, 2: 1 }, "6 דקות (4–9): דקות 0 ו־3 בחוץ");
  assert.deepEqual(pairs(await trending(redis, { windowMinutes: 1, n: 5, now: min(9) })), [[1, 2], [3, 1]], "דקה אחת (9)");
  assert.deepEqual(await trending(redis, { windowMinutes: 5, n: 5, now: min(30) }), [], "אין צפיות בחלון");
  const keys = await raw.keys(`${prefix}*`);
  assert.ok(keys.length > 0 && keys.every((k) => !k.includes("tmp")), "המפתח הזמני נמחק");
  for (const k of keys) assert.ok((await raw.ttl(k)) > 0, `${k} — עם תוקף`);
});
