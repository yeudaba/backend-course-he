import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";
import { sleep } from "../../tools/mq.mjs";

const { placeOrder, relayOutbox } = await load(import.meta.url, "P26.5-E17.ts");

test("placeOrder: הזמנה ושורת outbox — יחד", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  const id = await placeOrder(pool, { email: "tamar@example.com", totalCents: 4200 });
  const [row] = await db.rows("SELECT topic, key, payload, published_at FROM outbox");
  assert.deepEqual(row, { topic: "orders", key: String(id), payload: { type: "order.placed", orderId: id, email: "tamar@example.com", totalCents: 4200 }, published_at: null });
});
test("placeOrder נכשל ← גם אין שורת outbox", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  await assert.rejects(placeOrder(db.pool(3), { email: "x@example.com", totalCents: 0 }));
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM outbox"))[0].n, 0);
});
test("relay: שולח לפי הסדר ומסמן; ריצה שנייה — 0", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  const ids = [];
  for (let i = 1; i <= 3; i++) ids.push(await placeOrder(pool, { email: `c${i}@example.com`, totalCents: i * 100 }));
  const sent = [];
  assert.equal(await relayOutbox(pool, async (r) => void sent.push(r.payload.orderId)), 3);
  assert.deepEqual(sent, ids);
  assert.equal(await relayOutbox(pool, async () => assert.fail("נשלח פעמיים")), 0);
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM outbox WHERE published_at IS NULL"))[0].n, 0);
});
test("publish נכשל ← מה שנשלח מסומן, השאר מחכה (והשגיאה עולה)", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  for (let i = 1; i <= 4; i++) await placeOrder(pool, { email: `c${i}@example.com`, totalCents: 100 });
  let n = 0;
  await assert.rejects(relayOutbox(pool, async () => {
    if (++n === 3) throw new Error("broker down");
  }), /broker down/);
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM outbox WHERE published_at IS NULL"))[0].n, 2);
  const later = [];
  await relayOutbox(pool, async (r) => void later.push(r.id));
  assert.equal(later.length, 2);
});
test("שני relays במקביל ← כל שורה נשלחת פעם אחת", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(6);
  for (let i = 1; i <= 10; i++) await placeOrder(pool, { email: `c${i}@example.com`, totalCents: 100 });
  const sent = [];
  const publish = async (r) => {
    await sleep(20);
    sent.push(r.id);
  };
  const counts = await Promise.all([relayOutbox(pool, publish, { batch: 5 }), relayOutbox(pool, publish, { batch: 5 })]);
  assert.equal(counts[0] + counts[1], 10);
  assert.equal(new Set(sent).size, sent.length, "שורה נשלחה פעמיים");
});
