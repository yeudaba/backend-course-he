import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E48.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["reserve"])).reserve;
const stock = async (db, id) => (await db.rows("SELECT stock FROM inventory WHERE product_id = $1", [id]))[0].stock;
const codes = (results) => results.filter((r) => r.status === "rejected").map((r) => r.reason.code).sort();

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שמירה רגילה ושגיאות", async (t) => {
  const reserve = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.equal(await reserve(pool, 2, 10), 30);
  await assert.rejects(reserve(pool, 99, 1), (e) => e.code === "PRODUCT_NOT_FOUND");
  await assert.rejects(reserve(pool, 1, 2), (e) => e.code === "OUT_OF_STOCK", "מלאי 1, מבקשים 2");
  await db.query("UPDATE inventory SET stock = 4 WHERE product_id = 2");
  await assert.rejects(reserve(pool, 2, 3), (e) => e.code === "LOW_STOCK_LIMIT", "מלאי 4 (פחות מ־5) — עד 2");
  assert.equal(await reserve(pool, 2, 2), 2);
  await db.query("UPDATE inventory SET stock = 5 WHERE product_id = 2");
  assert.equal(await reserve(pool, 2, 5), 0, "מלאי 5 — הכלל לא חל");
  await withTimeout((async () => {
    for (let i = 0; i < 8; i++) await reserve(pool, 3, 1).catch(() => {});
  })(), 6000, "נתקע — חיבור לא שוחרר אחרי שגיאה");
  assert.equal(pool.idleCount, pool.totalCount);
});
test("15 שמירות של 3 במקביל, ממלאי 40", async (t) => {
  const reserve = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const results = await Promise.allSettled(Array.from({ length: 15 }, () => reserve(pool, 2, 3)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 12, "40 ← 37 ← ... ← 4: שתים־עשרה שמירות, ואז הכלל עוצר");
  assert.deepEqual(codes(results), ["LOW_STOCK_LIMIT", "LOW_STOCK_LIMIT", "LOW_STOCK_LIMIT"]);
  assert.equal(await stock(db, 2), 4);
});
test("6 שמירות של 1 במקביל, ממלאי 4", async (t) => {
  const reserve = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("UPDATE inventory SET stock = 4 WHERE product_id = 2");
  const pool = db.pool(6);
  const results = await Promise.allSettled(Array.from({ length: 6 }, () => reserve(pool, 2, 1)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 4);
  assert.deepEqual(codes(results), ["OUT_OF_STOCK", "OUT_OF_STOCK"]);
  assert.equal(await stock(db, 2), 0);
});
