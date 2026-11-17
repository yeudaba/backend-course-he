import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { recordEmailOnce } = await load(import.meta.url, "P26-E98.ts");

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE email_outbox (
    id serial PRIMARY KEY, kind text NOT NULL, order_id int NOT NULL, "to" text NOT NULL, subject text NOT NULL, body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (kind, order_id))`);
  return db;
}
const mail = (orderId, kind = "order-confirmation") => ({ kind, orderId, to: "dana@example.com", subject: `אישור הזמנה #${orderId}`, body: "שלום" });

test("sent, ואז duplicate", async (t) => {
  const db = await setup(t);
  const pool = db.pool();
  assert.equal(await recordEmailOnce(pool, mail(7)), "sent");
  assert.equal(await recordEmailOnce(pool, mail(7)), "duplicate");
  assert.equal(await recordEmailOnce(pool, mail(7, "shipped")), "sent", "סוג אחר — מייל אחר");
  assert.equal(await recordEmailOnce(pool, mail(8)), "sent");
  const rows = await db.rows('SELECT kind, order_id, "to", subject FROM email_outbox ORDER BY id');
  assert.deepEqual(rows, [
    { kind: "order-confirmation", order_id: 7, to: "dana@example.com", subject: "אישור הזמנה #7" },
    { kind: "shipped", order_id: 7, to: "dana@example.com", subject: "אישור הזמנה #7" },
    { kind: "order-confirmation", order_id: 8, to: "dana@example.com", subject: "אישור הזמנה #8" },
  ]);
});
test("10 במקביל ← sent אחד; שגיאה אחרת עולה", async (t) => {
  const db = await setup(t);
  const pool = db.pool(10);
  const r = await Promise.all(Array.from({ length: 10 }, () => recordEmailOnce(pool, mail(9))));
  assert.equal(r.filter((x) => x === "sent").length, 1);
  assert.equal(r.filter((x) => x === "duplicate").length, 9);
  await assert.rejects(recordEmailOnce(pool, { ...mail(10), subject: null }), (e) => e.code === "23502", "NOT NULL — לא duplicate");
});
