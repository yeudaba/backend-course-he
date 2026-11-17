import { test } from "node:test";
import assert from "node:assert/strict";
import { connectAdmin, mysqlUrl } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E85.ts", ["withTempDatabase"])).withTempDatabase;
const SEED = "CREATE TABLE t (id INT PRIMARY KEY, v VARCHAR(10)); INSERT INTO t VALUES (1, 'a'), (2, '🔥');";
async function dbs() {
  const admin = await connectAdmin();
  const [rows] = await admin.query("SHOW DATABASES LIKE 'test\\_%'");
  await admin.end();
  return rows.map((r) => Object.values(r)[0]);
}

test("seed, fn ותוצאה — ומחיקה", async () => {
  const f = await get();
  const before = await dbs();
  let name;
  const result = await f(mysqlUrl, SEED, async (pool) => {
    const [[row]] = await pool.query("SELECT DATABASE() AS db, COUNT(*) AS n FROM t");
    name = row.db;
    const [[e]] = await pool.query("SELECT v FROM t WHERE id = 2");
    return { n: Number(row.n), emoji: e.v };
  });
  assert.deepEqual(result, { n: 2, emoji: "🔥" });
  assert.match(name, /^test_/);
  assert.deepEqual(await dbs(), before, "נמחק");
});
test("fn נכשל / seed נכשל ← נמחק, השגיאה עוברת", async () => {
  const f = await get();
  const before = await dbs();
  await assert.rejects(f(mysqlUrl, SEED, async () => { throw new Error("boom"); }), { message: "boom" });
  await assert.rejects(f(mysqlUrl, "CREATE TABLE bad (", async () => 1), /syntax/i);
  assert.deepEqual(await dbs(), before);
});
test("fn איטי — לא נסגר באמצע; שני databases שונים במקביל", async () => {
  const f = await get();
  const names = await Promise.all([1, 2].map(() => f(mysqlUrl, SEED, async (pool) => {
    await new Promise((r) => setTimeout(r, 50));
    const [[row]] = await pool.query("SELECT DATABASE() AS db");
    return row.db;
  })));
  assert.notEqual(names[0], names[1]);
});
