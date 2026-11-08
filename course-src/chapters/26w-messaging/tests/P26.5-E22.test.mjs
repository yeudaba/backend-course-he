import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { kafkaSandbox, deadline } from "../../tools/mq.mjs";

const { publishStatus, syncStatuses } = await load(import.meta.url, "P26.5-E22.ts");

test("באג 1: עדכונים של אותה הזמנה — באותו partition", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 3 });
  const topic = await k.topic("status");
  const p = k.producer();
  for (const s of ["placed", "paid", "shipped", "delivered"]) for (const id of [1, 2]) await publishStatus(p, topic, id, s);
  const got = await k.readAll(topic, 8);
  for (const id of [1, 2]) {
    const mine = got.filter((m) => JSON.parse(m.value).orderId === id);
    assert.equal(new Set(mine.map((m) => m.partition)).size, 1, `הזמנה ${id} על כמה partitions — "delivered" יכול להיקרא לפני "paid"`);
  }
});
test("באג 2: save נכשל ← לא מאבדים את העדכון", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 1 });
  const topic = await k.topic("status", 1);
  const p = k.producer();
  for (const s of ["placed", "paid"]) await publishStatus(p, topic, 5, s);
  const opts = { brokers: k.brokers, groupId: k.groupId(), topic };
  await assert.rejects(
    deadline(syncStatuses(opts, async () => {
      throw new Error("db down");
    }, 2), 8000, "ה־consumer לא קיבל את ההודעות שכבר ב־topic (LATEST?)"),
    /db down/,
  );
  const saved = [];
  await deadline(syncStatuses(opts, async (id, s) => void saved.push(s), 2), 8000, "ה־consumer מחכה ולא מקבל את ההודעות — 'placed' אבד (commit לפני save), או שהוא קורא רק הודעות חדשות");
  assert.deepEqual(saved, ["placed", "paid"], "ה־commit קרה לפני save — 'placed' אבד");
});
test("באג 3: consumer group חדש רואה גם אירועים שנכתבו לפני שעלה", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 1 });
  const topic = await k.topic("status", 1);
  await publishStatus(k.producer(), topic, 8, "placed");
  const saved = [];
  await deadline(
    syncStatuses({ brokers: k.brokers, groupId: k.groupId(), topic }, async (id, s) => void saved.push(s), 1),
    8000,
    "ה־consumer מחכה רק להודעות חדשות (LATEST) — שירות חדש לא יודע על הזמנות קיימות",
  );
  assert.deepEqual(saved, ["placed"]);
});
