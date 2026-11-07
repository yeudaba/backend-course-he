import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { transferSafe } = await load(import.meta.url, "P18-E13.ts");

test("העברה ותוצאה", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.deepEqual(await transferSafe(pool, 1, 3, 100), { transferId: 1, fromBalance: 900, toBalance: 100 });
});
test("שגיאות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  await assert.rejects(transferSafe(pool, 1, 1, 10), (e) => e.code === "SAME_ACCOUNT");
  await assert.rejects(transferSafe(pool, 1, 3, 0), (e) => e.code === "INVALID_AMOUNT");
  await assert.rejects(transferSafe(pool, 1, 3, -5), (e) => e.code === "INVALID_AMOUNT");
  await assert.rejects(transferSafe(pool, 1, 99, 10), (e) => e.code === "ACCOUNT_NOT_FOUND");
  await assert.rejects(transferSafe(pool, 3, 1, 10), (e) => e.code === "INSUFFICIENT_FUNDS");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0);
  assert.equal(pool.idleCount, pool.totalCount, "החיבורים שוחררו");
});
test("40 העברות במקביל בשני הכיוונים — בלי deadlock", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const jobs = Array.from({ length: 40 }, (_, i) => (i % 2 ? transferSafe(pool, 1, 4, 10) : transferSafe(pool, 4, 1, 10)));
  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  assert.equal(failed.length, 0, `נכשלו: ${failed.map((r) => r.reason.code ?? r.reason.message).join(", ")}`);
  const [{ total }] = await db.rows("SELECT SUM(balance) AS total FROM accounts");
  assert.equal(total, 6250, "סך הכסף נשמר");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 40);
});
