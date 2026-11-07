import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";
import { countingPool } from "./_helpers.mjs";

const { latestOrdersWithCustomers } = await load(import.meta.url, "P18-E17.ts");

test("בלי N+1", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const expected = (await db.rows("SELECT o.id, o.total, p.full_name FROM big_orders o JOIN people p ON p.id = o.customer_id ORDER BY o.created_at DESC LIMIT 25"))
    .map((r) => ({ id: r.id, total: r.total, customerName: r.full_name }));
  for (const limit of [5, 25]) {
    const { pool, counter } = countingPool(db.pool(3));
    const got = await latestOrdersWithCustomers(pool, limit);
    assert.deepEqual(got, expected.slice(0, limit));
    assert.ok(counter.n <= 2, `limit ${limit}: ${counter.n} שאילתות — מותר עד 2`);
  }
});
