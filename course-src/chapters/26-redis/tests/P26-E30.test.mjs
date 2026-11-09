import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createRelay } = await load(import.meta.url, "P26-E30.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("אירוע משרת A מגיע פעם אחת ללקוחות של A ושל B", async (t) => {
  const sb = await redisSandbox(t);
  const channel = `${sb.prefix}orders`;
  const a = await createRelay({ pub: sb.redis, sub: await sb.client(), channel });
  const b = await createRelay({ pub: await sb.client(), sub: await sb.client(), channel });
  const got = { a1: [], a2: [], b1: [] };
  a.subscribe((d) => got.a1.push(d));
  a.subscribe((d) => got.a2.push(d));
  b.subscribe((d) => got.b1.push(d));
  await a.publish({ order: 7, status: "paid" });
  await sleep(150);
  assert.deepEqual(got, { a1: [{ order: 7, status: "paid" }], a2: [{ order: 7, status: "paid" }], b1: [{ order: 7, status: "paid" }] }, "כל מאזין — פעם אחת, גם בשרת ששלח");
  await a.close(); await b.close();
});
test("מנוי אחד ב־Redis לשרת, לא אחד לכל לקוח", async (t) => {
  const sb = await redisSandbox(t);
  const channel = `${sb.prefix}orders`;
  const a = await createRelay({ pub: sb.redis, sub: await sb.client(), channel });
  for (let i = 0; i < 5; i++) a.subscribe(() => {});
  const [, n] = await sb.raw.pubsub("NUMSUB", channel);
  assert.equal(n, 1);
  await a.close();
});
test("unsubscribe של לקוח, והודעות מערוץ אחר לא נכנסות", async (t) => {
  const sb = await redisSandbox(t);
  const channel = `${sb.prefix}orders`;
  const sub = await sb.client();
  const a = await createRelay({ pub: sb.redis, sub, channel });
  await sub.subscribe(`${sb.prefix}other`); // אותו חיבור, ערוץ נוסף
  const seen = [];
  const off = a.subscribe((d) => seen.push(d));
  await sb.raw.publish(`${sb.prefix}other`, JSON.stringify("wrong"));
  await a.publish(1);
  await sleep(100);
  off();
  await a.publish(2);
  await sleep(100);
  assert.deepEqual(seen, [1]);
  await a.close();
});
