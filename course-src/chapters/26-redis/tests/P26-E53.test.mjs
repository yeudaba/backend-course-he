import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { getWithEarlyRefresh } = await load(import.meta.url, "P26-E53.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(25)) if (await fn()) return true;
  return false;
}

test("MISS: טוען ושומר עם ttl", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  assert.deepEqual(await getWithEarlyRefresh(redis, "k", 100, async () => ({ v: 1 }), 10), { v: 1 });
  assert.equal(await raw.ttl(`${prefix}k`), 100);
  let calls = 0;
  assert.deepEqual(await getWithEarlyRefresh(redis, "k", 100, async () => { calls++; return { v: 2 }; }, 10), { v: 1 });
  await sleep(100);
  assert.equal(calls, 0, "TTL ארוך — אין רענון");
});
test("קרוב לפקיעה: מחזיר מיד את הישן, ורענון אחד ברקע גם עם 20 קריאות משני שרתים", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  await sb.raw.set(`${sb.prefix}k`, JSON.stringify({ v: "old" }), "EX", 3);
  let calls = 0;
  const slow = async () => { calls++; await sleep(200); return { v: "new" }; };
  const start = Date.now();
  const got = await Promise.all(Array.from({ length: 20 }, (_, i) => getWithEarlyRefresh(i % 2 ? second : sb.redis, "k", 100, slow, 10)));
  assert.ok(Date.now() - start < 150, `לקח ${Date.now() - start}ms — לא מחכים לרענון`);
  for (const g of got) assert.deepEqual(g, { v: "old" });
  assert.ok(await until(async () => (await sb.raw.get(`${sb.prefix}k`)) === '{"v":"new"}', 2000), "הערך התרענן ברקע");
  assert.equal(calls, 1, `רוענן ${calls} פעמים`);
  const ttl = await sb.raw.ttl(`${sb.prefix}k`);
  assert.ok(ttl > 95, `ttl מלא אחרי רענון (${ttl})`);
  assert.ok(await until(async () => (await sb.raw.exists(`${sb.prefix}k:refresh`)) === 0, 1000), "המנעול נמחק בסוף");
});
test("רענון שנכשל — הערך הישן נשאר, בלי unhandled rejection", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const rejections = [];
  const onRej = (e) => rejections.push(e);
  process.on("unhandledRejection", onRej);
  t.after(() => process.off("unhandledRejection", onRej));
  await raw.set(`${prefix}k`, JSON.stringify(1), "EX", 3);
  assert.equal(await getWithEarlyRefresh(redis, "k", 100, async () => { throw new Error("db down"); }, 10), 1);
  await sleep(200);
  assert.equal(rejections.length, 0, `unhandled rejection: ${rejections[0]?.message}`);
  assert.equal(await raw.get(`${prefix}k`), "1");
  assert.equal(await raw.exists(`${prefix}k:refresh`), 0, "המנעול שוחרר גם בכישלון");
});
