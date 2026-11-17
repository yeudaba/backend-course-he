import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const run = async (t, setup) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  if (setup) await db.query(setup);
  const rows = await db.fileRows("P18-E47.sql");
  const balances = (await db.rows("SELECT balance FROM accounts ORDER BY id")).map((r) => r.balance);
  return { rows, balances };
};
test("P18-E47: אין מספיק — אפס שורות, בלי שינוי", async (t) => {
  const { rows, balances } = await run(t);
  assert.deepEqual(rows, [], "ל־Yossi 250 — אפס שורות");
  assert.deepEqual(balances, [1000, 250, 0, 5000]);
});
test("P18-E47: יש מספיק — מושך ומחזיר id ו־balance", async (t) => {
  const r1 = await run(t, "UPDATE accounts SET balance = 300 WHERE id = 2");
  assert.deepEqual(r1.rows, [{ id: 2, balance: 0 }], "בדיוק 300 — מותר");
  assert.deepEqual(r1.balances, [1000, 0, 0, 5000]);
  const r2 = await run(t, "UPDATE accounts SET balance = 1234.5 WHERE id = 2");
  assert.deepEqual(r2.rows, [{ id: 2, balance: 934.5 }]);
  const r3 = await run(t, "UPDATE accounts SET balance = 299.99 WHERE id = 2");
  assert.deepEqual(r3.rows, [], "299.99 — לא מספיק");
});
