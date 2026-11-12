import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E54.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["transferWithLimit"])).transferWithLimit;
const balances = async (db) => (await db.rows("SELECT balance FROM accounts ORDER BY id")).map((r) => r.balance);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מגבלה, העברות מאתמול, ושגיאות", async (t) => {
  const transferWithLimit = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("INSERT INTO transfers (from_id, to_id, amount, created_at) VALUES (1, 3, 900, now() - interval '1 day'), (4, 1, 50, now())");
  const pool = db.pool(3);
  assert.equal(await transferWithLimit(pool, 1, 3, 200, 500), 3, "ההעברה מאתמול לא נספרת; ההעברה הנכנסת לא נספרת");
  assert.equal(await transferWithLimit(pool, 1, 2, 300, 500), 4, "200 + 300 = 500 — בדיוק המגבלה");
  await assert.rejects(transferWithLimit(pool, 1, 2, 0.01, 500), (e) => e.code === "DAILY_LIMIT");
  assert.equal(await transferWithLimit(pool, 4, 2, 0.01, 500), 5, "המגבלה לכל חשבון בנפרד");
  await assert.rejects(transferWithLimit(pool, 99, 2, 1, 500), (e) => e.code === "ACCOUNT_NOT_FOUND");
  assert.deepEqual(await balances(db), [500, 550.01, 200, 4999.99]);
  await withTimeout((async () => {
    for (let i = 0; i < 8; i++) await transferWithLimit(pool, 1, 2, 1, 500).catch(() => {});
  })(), 6000, "נתקע — חיבור לא שוחרר אחרי שגיאה");
});
test("10 העברות של 100 במקביל, מגבלה 300", async (t) => {
  const transferWithLimit = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const results = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => transferWithLimit(pool, 4, 1 + (i % 3), 100, 300)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  assert.ok(results.filter((r) => r.status === "rejected").every((r) => r.reason.code === "DAILY_LIMIT"));
  assert.equal((await db.rows("SELECT SUM(amount) AS s FROM transfers WHERE from_id = 4"))[0].s, 300);
  assert.equal((await balances(db))[3], 4700);
});
