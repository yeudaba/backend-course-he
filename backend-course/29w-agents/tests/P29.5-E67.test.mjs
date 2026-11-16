import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { refundWithGuard } = await load(import.meta.url, "P29.5-E67.ts");

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE orders (id int PRIMARY KEY, customer_id int NOT NULL, total_cents int NOT NULL, status text NOT NULL);
    CREATE TABLE refunds (id serial PRIMARY KEY, order_id int NOT NULL REFERENCES orders, amount_cents int NOT NULL, tool_use_id text NOT NULL UNIQUE);
    INSERT INTO orders VALUES (201, 1, 10000, 'paid'), (202, 1, 5000, 'shipped'), (203, 1, 5000, 'pending'), (301, 2, 9000, 'paid');`);
  const pool = db.pool(6);
  return { db, pool };
}
const R = (o) => ({ customerId: 1, orderId: 201, amountCents: 1000, toolUseId: `t-${Math.random()}`, maxCents: 20000, ...o });

test("החזר תקין, ואז duplicate על אותו tool_use_id", async (t) => {
  const { db, pool } = await setup(t);
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 3000, toolUseId: "t1" })), { status: "refunded", remainingCents: 7000 });
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 3000, toolUseId: "t1" })), { status: "duplicate" });
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 7000, toolUseId: "t2" })), { status: "refunded", remainingCents: 0 });
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 1, toolUseId: "t3" })), { status: "rejected", reason: "over_remaining" });
  assert.deepEqual(await refundWithGuard(pool, R({ orderId: 202, amountCents: 5000, toolUseId: "t4" })), { status: "refunded", remainingCents: 0 }, "shipped מותר");
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM refunds"))[0].n, 3);
});
test("כל הדחיות, בסדר", async (t) => {
  const { db, pool } = await setup(t);
  for (const amountCents of [0, -5, 10.5, NaN]) assert.deepEqual(await refundWithGuard(pool, R({ amountCents, orderId: 999 })), { status: "rejected", reason: "bad_amount" });
  assert.deepEqual(await refundWithGuard(pool, R({ orderId: 999 })), { status: "rejected", reason: "not_found" });
  assert.deepEqual(await refundWithGuard(pool, R({ orderId: 301 })), { status: "rejected", reason: "not_found" }, "של לקוח אחר");
  assert.deepEqual(await refundWithGuard(pool, R({ orderId: 203 })), { status: "rejected", reason: "bad_status" });
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 20001, maxCents: 20000, orderId: 203 })), { status: "rejected", reason: "bad_status" }, "status לפני over_limit");
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 6000, maxCents: 5000 })), { status: "rejected", reason: "over_limit" });
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 10001 })), { status: "rejected", reason: "over_remaining" });
  await refundWithGuard(pool, R({ amountCents: 100, toolUseId: "dup" }));
  assert.deepEqual(await refundWithGuard(pool, R({ amountCents: 999999, orderId: 201, toolUseId: "dup" })), { status: "duplicate" }, "duplicate לפני over_limit");
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM refunds"))[0].n, 1);
  assert.equal(pool.totalCount - pool.idleCount, 0, "כל החיבורים חזרו ל־pool");
});
test("חמישה במקביל על אותה הזמנה — רק מה שנכנס בסכום", async (t) => {
  const { db, pool } = await setup(t);
  const r = await Promise.all(Array.from({ length: 5 }, (_, i) => refundWithGuard(pool, R({ amountCents: 4000, toolUseId: `p${i}` }))));
  assert.equal(r.filter((x) => x.status === "refunded").length, 2, JSON.stringify(r));
  assert.equal(r.filter((x) => x.status === "rejected" && x.reason === "over_remaining").length, 3);
  assert.equal((await db.rows("SELECT sum(amount_cents)::int AS s FROM refunds"))[0].s, 8000);
  const same = await Promise.all([1, 2, 3].map(() => refundWithGuard(pool, R({ orderId: 202, amountCents: 100, toolUseId: "retry" }))));
  assert.deepEqual(same.map((x) => x.status).sort(), ["duplicate", "duplicate", "refunded"], "retries במקביל עם אותו id");
  assert.equal(pool.totalCount - pool.idleCount, 0);
});
