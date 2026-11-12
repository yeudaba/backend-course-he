import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor, sleep } from "../../tools/mq.mjs";

const { subscribeInstance, broadcast } = await load(import.meta.url, "P26.5-E53.ts");

test("כל instance מקבל כל הודעה; cancel עוצר", async (t) => {
  const r = await rabbitSandbox(t);
  const exchange = r.exchange("cache");
  const c1 = await (await r.connect()).createChannel();
  const c2 = await (await r.connect()).createChannel();
  const a = [], b = [];
  const subA = await subscribeInstance(c1, exchange, (d) => a.push(d));
  const subB = await subscribeInstance(c2, exchange, (d) => b.push(d));
  assert.notEqual(subA.queue, subB.queue, "תור לכל instance");
  assert.match(subA.queue, /^amq\.gen-/, "שם שהשרת בחר");
  const pub = await r.channel();
  assert.equal(broadcast(pub, exchange, { invalidate: "products" }), true);
  broadcast(pub, exchange, { invalidate: "orders" });
  await waitFor(() => a.length === 2 && b.length === 2, { message: `A קיבל ${a.length}, B קיבל ${b.length}` });
  assert.deepEqual(a, [{ invalidate: "products" }, { invalidate: "orders" }]);
  assert.deepEqual(b, a);
  await subA.cancel();
  broadcast(pub, exchange, { invalidate: "x" });
  await waitFor(() => b.length === 3);
  await sleep(100);
  assert.equal(a.length, 2, "אחרי cancel — לא מקבל");
  const q = await c2.checkQueue(subB.queue); // exclusive — רק מאותו חיבור
  assert.equal(q.messageCount, 0, "noAck — שום דבר לא נשאר בתור");
});
test("התור נמחק כשהחיבור נסגר (exclusive)", async (t) => {
  const r = await rabbitSandbox(t);
  const exchange = r.exchange("cache");
  const conn = await r.connect();
  const ch = await conn.createChannel();
  const { queue } = await subscribeInstance(ch, exchange, () => {});
  await conn.close();
  await sleep(100);
  const probe = await r.channel();
  await assert.rejects(probe.checkQueue(queue), "תור exclusive נמחק עם החיבור");
});
