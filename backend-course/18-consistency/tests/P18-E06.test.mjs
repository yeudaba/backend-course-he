import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("העברה ב־transaction", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E06.sql");
  const bal = Object.fromEntries((await db.rows("SELECT id, balance FROM accounts")).map((r) => [r.id, r.balance]));
  assert.deepEqual([bal[1], bal[3]], [800, 200]);
  const transfers = await db.rows("SELECT from_id, to_id, amount FROM transfers");
  assert.deepEqual(transfers, [{ from_id: 1, to_id: 3, amount: 200 }]);
  assert.equal((await db.rows("SELECT now() = statement_timestamp() AS outside")).at(0).outside, true, "ה־transaction צריך להיסגר (COMMIT)");
});
