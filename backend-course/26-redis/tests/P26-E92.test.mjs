import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox, redisUrl } from "../../tools/redis.mjs";

const { createRedisOrNull } = await load(import.meta.url, "P26-E92.ts");

test("בלי url ← null", () => {
  assert.equal(createRedisOrNull(undefined, "shop"), null);
  assert.equal(createRedisOrNull("", "shop"), null);
  assert.equal(createRedisOrNull("   ", "shop"), null);
});
test("עם url ← חיבור עם ההגדרות של הפרויקט", async (t) => {
  const sb = await redisSandbox(t);
  const prefix = sb.prefix.slice(0, -1); // "chk:...:xxxx" — הבודק מנקה אותו בסוף
  const r = createRedisOrNull(redisUrl, prefix);
  t.after(() => r?.quit().catch(() => r.disconnect()));
  assert.ok(r, "צריך להחזיר חיבור");
  assert.equal(r.options.keyPrefix, `${prefix}:`);
  assert.equal(r.options.maxRetriesPerRequest, 2);
  assert.equal(r.options.enableOfflineQueue, false);
  for (let i = 0; i < 40 && r.status !== "ready"; i++) await new Promise((res) => setTimeout(res, 50));
  await r.set("hello", "1");
  assert.equal(await sb.raw.get(`${prefix}:hello`), "1", "המפתח נשמר עם הקידומת");
});
