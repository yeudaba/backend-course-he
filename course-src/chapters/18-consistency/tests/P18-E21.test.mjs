import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { buy } = await load(import.meta.url, "P18-E21.ts");

test("קנייה רגילה ושגיאות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.equal(await buy(pool, 2, 5), 35);
  await assert.rejects(buy(pool, 3, 1), (e) => e.code === "OUT_OF_STOCK");
  await assert.rejects(buy(pool, 99, 1), (e) => e.code === "PRODUCT_NOT_FOUND");
});
test("10 קניות במקביל של הפריט האחרון", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => buy(pool, 1, 1)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1, "בדיוק קנייה אחת מצליחה");
  assert.ok(results.filter((r) => r.status === "rejected").every((r) => r.reason.code === "OUT_OF_STOCK"));
  assert.equal((await db.rows("SELECT stock FROM inventory WHERE product_id = 1"))[0].stock, 0);
});
test("40 קניות במקביל, 2 יחידות כל אחת", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const results = await Promise.allSettled(Array.from({ length: 40 }, () => buy(pool, 2, 2)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 20, "40 יחידות במלאי ← 20 קניות של 2");
  assert.equal((await db.rows("SELECT stock FROM inventory WHERE product_id = 2"))[0].stock, 0);
});
