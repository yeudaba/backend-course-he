import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { acquire, release } = await load(import.meta.url, "P26-E22.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("למנעול יש תוקף", async (t) => {
  const { redis } = await redisSandbox(t);
  await acquire(redis, "nightly", 300);
  const pttl = await redis.pttl("lock:nightly");
  assert.ok(pttl > 0 && pttl <= 300, `PTTL ${pttl} — שרת שקרס לא נועל לנצח`);
});
test("לכל מחזיק — token משלו", async (t) => {
  const { redis } = await redisSandbox(t);
  const a = await acquire(redis, "x", 200);
  await sleep(250);
  const b = await acquire(redis, "x", 5000);
  assert.ok(a && b && a !== b, "tokens שונים");
});
test("שחרור — רק של הבעלים", async (t) => {
  const sb = await redisSandbox(t);
  const other = await sb.client();
  const a = await acquire(sb.redis, "x", 200);
  await sleep(250);
  const b = await acquire(other, "x", 5000);
  assert.ok(b, "B לקח אחרי שהתוקף של A נגמר");
  assert.equal(await release(sb.redis, "x", a), false, "A (האיטי) לא מוחק את המנעול של B");
  assert.equal(await sb.redis.exists("lock:x"), 1);
  assert.equal(await release(other, "x", b), true);
});
