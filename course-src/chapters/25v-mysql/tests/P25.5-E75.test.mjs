import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf, code } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E75.ts", ["createCustomer"])).createCustomer;

test("יצירה ונרמול", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  assert.deepEqual(await f(pool, { name: " Omer ", email: " Omer@Example.COM ", city: " Eilat " }), { id: 6, name: "Omer", email: "omer@example.com", city: "Eilat" });
  assert.deepEqual(await db.rows("SELECT name, email, city FROM customers WHERE id = 6"), [{ name: "Omer", email: "omer@example.com", city: "Eilat" }]);
  assert.equal((await f(pool, { name: "T", email: "t@x.io", city: "H" })).id, 7);
  assert.doesNotMatch(code(import.meta.url, "P25.5-E75.ts"), /LAST_INSERT_ID|MAX\s*\(/i, "ה־id מ־insertId");
});
test("אימייל תפוס, ושגיאות אחרות", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  await assert.rejects(f(pool, { name: "x", email: "DANA@example.com", city: "x" }), { message: "EMAIL_TAKEN" });
  await assert.rejects(f(pool, { name: "x".repeat(150), email: "long@x.io", city: "x" }), (e) => e.message !== "EMAIL_TAKEN", "שגיאה אחרת עוברת כמו שהיא");
});
