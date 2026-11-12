import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { withLockRetry } = await load(import.meta.url, "P26-E70.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("5 במקביל משני שרתים — אחד בכל רגע, וכולם מסיימים", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  let active = 0, max = 0;
  const order = [];
  const job = (i) => async () => { active++; max = Math.max(max, active); await sleep(30); order.push(i); active--; return i * 10; };
  const results = await Promise.all([0, 1, 2, 3, 4].map((i) => withLockRetry(i % 2 ? second : sb.redis, "report", 1000, job(i), { retries: 20, delayMs: 20 })));
  assert.deepEqual(results, [0, 10, 20, 30, 40], "כל אחד מקבל את התוצאה של ה־fn שלו");
  assert.equal(max, 1, "שתי עבודות רצו במקביל — המנעול משתחרר לפני ש־fn סיים?");
  assert.equal(order.length, 5);
  assert.equal(await sb.raw.exists(`${sb.prefix}lock:report`), 0, "בסוף — אין מנעול");
});
test("תפוס עד הסוף ← LOCKED, אחרי retries ניסיונות", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await raw.set(`${prefix}lock:x`, "someone-else", "PX", 5000);
  let ran = false;
  const start = Date.now();
  await assert.rejects(withLockRetry(redis, "x", 1000, async () => { ran = true; }, { retries: 3, delayMs: 40 }), { message: "LOCKED" });
  const took = Date.now() - start;
  assert.ok(took >= 110 && took < 1000, `3 המתנות של 40ms (${took}ms)`);
  assert.equal(ran, false);
  assert.equal(await raw.get(`${prefix}lock:x`), "someone-else", "לא נוגעים במנעול של אחר");
});
test("fn זרק ← משחרר ומעביר את השגיאה; לא מוחק מנעול שעבר יד", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await assert.rejects(withLockRetry(redis, "y", 1000, async () => { throw new Error("boom"); }), { message: "boom" });
  assert.equal(await raw.exists(`${prefix}lock:y`), 0);
  await withLockRetry(redis, "z", 1000, async () => {
    await raw.set(`${prefix}lock:z`, "other-token", "PX", 5000); // "פג ונלקח על ידי אחר"
  });
  assert.equal(await raw.get(`${prefix}lock:z`), "other-token", "שחרור רק אם ה־token שלך");
  const pttl = await raw.pttl(`${prefix}lock:z`);
  assert.ok(pttl > 0);
});
test("PX: המנעול עם תוקף", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await withLockRetry(redis, "w", 800, async () => {
    const pttl = await raw.pttl(`${prefix}lock:w`);
    assert.ok(pttl > 0 && pttl <= 800, `pttl ${pttl}`);
  });
});
