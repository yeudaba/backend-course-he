import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E72.ts", ["handlePaymentEvent"])).handlePaymentEvent;

test("פעם ראשונה ופעם שנייה", async (t) => {
  const handle = await get();
  const db = await sandbox(t, import.meta.url, "webhooks.sql");
  const pool = db.pool(3);
  assert.equal(await handle(pool, { id: "evt_91", orderId: 42, amountCents: 4990 }), "processed");
  assert.equal(await handle(pool, { id: "evt_91", orderId: 42, amountCents: 4990 }), "duplicate");
  assert.equal(await handle(pool, { id: "evt_92", orderId: 42, amountCents: 10 }), "processed", "אירוע אחר לאותה הזמנה");
  assert.deepEqual(await db.rows("SELECT id, status, paid_cents FROM orders ORDER BY id"), [
    { id: 42, status: "paid", paid_cents: 5000 },
    { id: 43, status: "pending", paid_cents: 0 },
  ]);
  assert.deepEqual((await db.rows("SELECT event_id FROM processed_events ORDER BY 1")).map((r) => r.event_id), ["evt_91", "evt_92"]);
});
test("הזמנה לא קיימת ← שגיאה, והאירוע לא נרשם", async (t) => {
  const handle = await get();
  const db = await sandbox(t, import.meta.url, "webhooks.sql");
  const pool = db.pool(3);
  await assert.rejects(handle(pool, { id: "evt_x", orderId: 999, amountCents: 1 }), { message: "ORDER_NOT_FOUND" });
  assert.deepEqual(await db.rows("SELECT * FROM processed_events"), []);
  assert.equal(pool.totalCount - pool.idleCount, 0, "החיבור חזר ל־pool");
  await db.query("INSERT INTO orders (id) VALUES (999)");
  assert.equal(await handle(pool, { id: "evt_x", orderId: 999, amountCents: 1 }), "processed", "אחרי תיקון — אפשר לטפל");
});
test("10 במקביל ← פעם אחת", async (t) => {
  const handle = await get();
  const db = await sandbox(t, import.meta.url, "webhooks.sql");
  const pool = db.pool(10);
  const results = await Promise.all(Array.from({ length: 10 }, () => handle(pool, { id: "evt_race", orderId: 43, amountCents: 700 })));
  assert.equal(results.filter((r) => r === "processed").length, 1);
  assert.equal(results.filter((r) => r === "duplicate").length, 9);
  assert.deepEqual(await db.rows("SELECT paid_cents FROM orders WHERE id = 43"), [{ paid_cents: 700 }]);
  assert.equal(pool.totalCount - pool.idleCount, 0, "כל החיבורים חזרו ל־pool");
});
