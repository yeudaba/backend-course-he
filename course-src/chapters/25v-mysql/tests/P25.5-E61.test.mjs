import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E61.ts", ["transfer"])).transfer;
const balances = async (db) => Object.fromEntries((await db.rows("SELECT customer_id, balance FROM wallets ORDER BY customer_id")).map((r) => [r.customer_id, r.balance]));

test("העברה רגילה ושגיאות", async (t) => {
  const transfer = await get();
  const db = await mysqlSandbox(t, import.meta.url, "locks.sql");
  const pool = db.pool(3);
  assert.deepEqual(await transfer(pool, 1, 2, 30), { from: 70, to: 80 });
  await assert.rejects(transfer(pool, 3, 1, 1), { message: "INSUFFICIENT_FUNDS" });
  await assert.rejects(transfer(pool, 1, 99, 1), { message: "WALLET_NOT_FOUND" });
  await assert.rejects(transfer(pool, 1, 1, 1), { message: "SAME_WALLET" });
  for (const a of [0, -5, 1.5]) await assert.rejects(transfer(pool, 1, 2, a), RangeError);
  assert.deepEqual(await balances(db), { 1: 70, 2: 80, 3: 0, 4: 1000 }, "השגיאות לא שינו כלום");
  assert.deepEqual(await transfer(pool, 2, 1, 80), { from: 0, to: 150 }, "בדיוק כל היתרה");
  assert.equal(pool.pool._allConnections.length - pool.pool._freeConnections.length, 0, "כל החיבורים חזרו ל־pool");
});
test("40 העברות הפוכות במקביל — בלי deadlock", async (t) => {
  const transfer = await get();
  const db = await mysqlSandbox(t, import.meta.url, "locks.sql");
  const pool = db.pool(10);
  const jobs = [];
  for (let i = 0; i < 20; i++) {
    jobs.push(transfer(pool, 1, 4, 1));
    jobs.push(transfer(pool, 4, 1, 1));
  }
  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  assert.equal(failed.length, 0, `נכשלו ${failed.length}: ${failed[0]?.reason?.message ?? ""}`);
  assert.deepEqual(await balances(db), { 1: 100, 2: 50, 3: 0, 4: 1000 });
});
