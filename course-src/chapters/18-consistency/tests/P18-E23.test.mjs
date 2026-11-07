import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";
import { countingPool } from "./_helpers.mjs";

const { customersWithOrderCounts } = await load(import.meta.url, "P18-E23.ts");

test("2 שאילתות, אותה תוצאה", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("INSERT INTO people VALUES (20001, 'No Orders Yet')");
  const ids = [42, 7, 999999, 20001, 1, 42];
  const { pool, counter } = countingPool(db.pool(3));
  const got = await customersWithOrderCounts(pool, ids);
  assert.deepEqual(got, [
    { id: 42, fullName: "Customer #42", orders: 100 },
    { id: 7, fullName: "Customer #7", orders: 100 },
    { id: 20001, fullName: "No Orders Yet", orders: 0 },
    { id: 1, fullName: "Customer #1", orders: 100 },
    { id: 42, fullName: "Customer #42", orders: 100 },
  ]);
  assert.ok(counter.n <= 2, `${counter.n} שאילתות — מותר עד 2`);
});
