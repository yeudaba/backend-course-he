import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { kafkaSandbox } from "../../tools/mq.mjs";

const { publishOrderEvents } = await load(import.meta.url, "P26.5-E12.ts");
const at = "2026-11-08T10:00:00.000Z";

test("כל האירועים של הזמנה ב־partition אחד, בסדר שנשלחו", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 3 });
  const topic = await k.topic("orders");
  const types = ["order.placed", "order.paid", "order.shipped"];
  const events = [];
  for (const type of types) for (const orderId of [101, 102, 103, 104]) events.push({ eventId: `${orderId}-${type}`, orderId, type, at });
  await publishOrderEvents(k.producer(), topic, events);
  const got = await k.readAll(topic, 12);
  assert.equal(got.length, 12);
  for (const orderId of [101, 102, 103, 104]) {
    const mine = got.filter((m) => m.key === String(orderId));
    assert.equal(new Set(mine.map((m) => m.partition)).size, 1, `הזמנה ${orderId} פוזרה על כמה partitions — חסר key?`);
    assert.deepEqual(mine.sort((a, b) => a.offset - b.offset).map((m) => JSON.parse(m.value).type), types);
  }
  assert.ok(new Set(got.map((m) => m.partition)).size > 1, "הזמנות שונות מתפזרות — זה מה שנותן מקביליות");
});
test("value הוא ה־JSON של האירוע, ו־headers עם סוג ו־id", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 1 });
  const topic = await k.topic("orders", 1);
  const e = { eventId: "e-1", orderId: 7, type: "order.paid", at, data: { totalCents: 8990 } };
  await publishOrderEvents(k.producer(), topic, [e]);
  const [m] = await k.readAll(topic, 1);
  assert.deepEqual(JSON.parse(m.value), e);
  assert.equal(m.headers["event-type"], "order.paid");
  assert.equal(m.headers["event-id"], "e-1");
});
