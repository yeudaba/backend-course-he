import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { withDeadlockRetry } = await load(import.meta.url, "P25.5-E15.ts");
const err = (errno) => Object.assign(new Error("x"), { errno });

test("1213 ו־1205 ← מנסים שוב; אחרים ← זורקים", async () => {
  let n = 0;
  const r = await withDeadlockRetry(async () => { if (++n < 3) throw err(n === 1 ? 1213 : 1205); return "ok"; }, { sleep: async () => {} });
  assert.equal(r, "ok");
  assert.equal(n, 3);
  let m = 0;
  await assert.rejects(withDeadlockRetry(async () => { m++; throw err(1062); }, { sleep: async () => {} }), (e) => e.errno === 1062);
  assert.equal(m, 1, "Duplicate entry — לא deadlock");
  let k = 0;
  await assert.rejects(withDeadlockRetry(async () => { k++; throw err(1213); }, { retries: 2, sleep: async () => {} }));
  assert.equal(k, 3);
});
test("deadlock אמיתי ב־InnoDB — ואחרי retry שתי הטרנזקציות מצליחות", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(4);
  let deadlocks = 0;
  // שתי טרנזקציות שנועלות את מוצרים 1 ו־3 בסדר הפוך
  const transfer = (first, second) => withDeadlockRetry(async () => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE products SET stock = stock - 1 WHERE id = ?", [first]);
      await new Promise((r) => setTimeout(r, 150));
      await conn.query("UPDATE products SET stock = stock + 1 WHERE id = ?", [second]);
      await conn.commit();
    } catch (e) {
      if (e.errno === 1213) deadlocks++;
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }, { retries: 5 });
  await Promise.all([transfer(1, 3), transfer(3, 1)]);
  assert.ok(deadlocks >= 1, "InnoDB זיהה deadlock (errno 1213)");
  assert.deepEqual((await db.rows("SELECT stock FROM products WHERE id IN (1, 3) ORDER BY id")).map((r) => r.stock), [40, 120]);
});
