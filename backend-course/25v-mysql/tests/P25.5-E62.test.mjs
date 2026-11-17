import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E62.ts", ["reserveSeat"])).reserveSeat;

test("reserved, taken, not_found", async (t) => {
  const reserveSeat = await get();
  const db = await mysqlSandbox(t, import.meta.url, "locks.sql");
  const pool = db.pool(3);
  assert.equal(await reserveSeat(pool, 1, 42), "reserved");
  assert.equal(await reserveSeat(pool, 1, 43), "taken");
  assert.equal(await reserveSeat(pool, 3, 42), "taken", "מושב שכבר הוזמן בנתונים");
  assert.equal(await reserveSeat(pool, 99, 42), "not_found");
  assert.deepEqual(await db.rows("SELECT id, reserved_by FROM seats ORDER BY id"), [{ id: 1, reserved_by: 42 }, { id: 2, reserved_by: null }, { id: 3, reserved_by: 7 }]);
});
test("נעול ← busy מיד, ואחרי השחרור — reserved", async (t) => {
  const reserveSeat = await get();
  const db = await mysqlSandbox(t, import.meta.url, "locks.sql");
  const pool = db.pool(3);
  const other = await mysql.createConnection(db.url);
  t.after(() => other.end());
  await other.query("START TRANSACTION");
  await other.query("SELECT * FROM seats WHERE id = 2 FOR UPDATE");
  const started = Date.now();
  assert.equal(await reserveSeat(pool, 2, 50), "busy");
  assert.ok(Date.now() - started < 2000, "לא חיכה לנעילה");
  assert.equal(await reserveSeat(pool, 1, 50), "reserved", "מושב אחר — פנוי");
  await other.query("ROLLBACK");
  assert.equal(await reserveSeat(pool, 2, 51), "reserved");
  assert.equal(pool.pool._allConnections.length - pool.pool._freeConnections.length, 0, "כל החיבורים חזרו ל־pool");
});
