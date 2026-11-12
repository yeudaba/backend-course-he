import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { rebuildBestsellers, topBestsellers } = await load(import.meta.url, "P26-E42.ts");

test("בונה מחדש משורות (qty כמחרוזת), ומחליף את הקודם", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await redis.zadd("best", 999, "77");
  const n = await rebuildBestsellers(redis, "best", [
    { product_id: 3, qty: "12" },
    { product_id: 5, qty: "9" },
    { product_id: 8, qty: 30 },
  ]);
  assert.equal(n, 3);
  assert.deepEqual(await topBestsellers(redis, "best", 10), [
    { productId: 8, qty: 30 },
    { productId: 3, qty: 12 },
    { productId: 5, qty: 9 },
  ], "מוצר 77 מהדירוג הקודם לא נשאר; 12 לפני 9 (מספרים, לא מחרוזות)");
  assert.deepEqual(await topBestsellers(redis, "best", 2), [{ productId: 8, qty: 30 }, { productId: 3, qty: 12 }]);
  const ttl = await raw.ttl(`${prefix}best`);
  assert.ok(ttl > 86000 && ttl <= 86400, `תוקף של יום (${ttl})`);
  await rebuildBestsellers(redis, "best", [{ product_id: 3, qty: "12" }]);
  assert.deepEqual(await topBestsellers(redis, "best", 10), [{ productId: 3, qty: 12 }], "בנייה שנייה לא מכפילה");
});
test("בלי שורות — המפתח לא קיים", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await redis.zadd("b2", 1, "1");
  assert.equal(await rebuildBestsellers(redis, "b2", []), 0);
  assert.equal(await raw.exists(`${prefix}b2`), 0);
  assert.deepEqual(await topBestsellers(redis, "b2", 5), []);
});
test("קורא לא רואה דירוג חצי בנוי (MULTI)", async (t) => {
  const sb = await redisSandbox(t);
  const reader = await sb.client();
  const rows = Array.from({ length: 300 }, (_, i) => ({ product_id: i + 1, qty: String(i + 1) }));
  await rebuildBestsellers(sb.redis, "big", rows);
  const sizes = new Set();
  const job = rebuildBestsellers(sb.redis, "big", rows);
  for (let i = 0; i < 30; i++) sizes.add(await reader.zcard("big"));
  await job;
  for (const s of sizes) assert.equal(s, 300, `קורא ראה ${s} מוצרים באמצע הבנייה — עטוף ב־MULTI`);
});
