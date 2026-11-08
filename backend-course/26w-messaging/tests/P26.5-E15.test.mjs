import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { handlePaymentEvent } = await load(import.meta.url, "P26.5-E15.ts");
const ev = { eventId: "pay-1", orderId: 1, amountCents: 8990 };

test("פעם ראשונה ← processed; תשלום אחד וההזמנה paid", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  assert.equal(await handlePaymentEvent(pool, ev), "processed");
  assert.deepEqual(await db.rows("SELECT order_id, amount_cents, event_id FROM payments"), [{ order_id: 1, amount_cents: 8990, event_id: "pay-1" }]);
  assert.equal((await db.rows("SELECT status FROM orders WHERE id = 1"))[0].status, "paid");
});
test("אותו אירוע שוב ← duplicate, בלי תשלום כפול", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  await handlePaymentEvent(pool, ev);
  assert.equal(await handlePaymentEvent(pool, ev), "duplicate");
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM payments"))[0].n, 1);
});
test("אותו אירוע פעמיים במקביל (שני consumers) ← תשלום אחד", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(6);
  const results = await Promise.all([1, 2, 3, 4].map(() => handlePaymentEvent(pool, { ...ev, eventId: "pay-race" })));
  assert.deepEqual(results.sort(), ["duplicate", "duplicate", "duplicate", "processed"]);
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM payments"))[0].n, 1);
});
test("כישלון באמצע ← שום דבר לא נשמר, כולל הסימון — ואפשר לנסות שוב", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  await assert.rejects(handlePaymentEvent(pool, { eventId: "pay-x", orderId: 999, amountCents: 100 }));
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM processed_events"))[0].n, 0, "הסימון נשאר — וה־retry ידלג על תשלום שלא קרה");
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM payments"))[0].n, 0);
});
