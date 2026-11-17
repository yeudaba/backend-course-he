import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E78.ts", ["createCustomers"])).createCustomers;
const list = (n, from = 0) => Array.from({ length: n }, (_, i) => ({ name: `C${from + i}`, email: `c${from + i}@x.io`, city: "Haifa" }));

test("INSERT אחד, ids נכונים", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  let calls = 0;
  const spy = { query: (...a) => { calls++; return pool.query(...a); }, execute: (...a) => { calls++; return pool.execute(...a); } };
  const res = await f(spy, list(30));
  assert.equal(calls, 1, "פקודה אחת");
  assert.equal(res.length, 30);
  for (const r of res) {
    const [row] = await db.rows("SELECT email FROM customers WHERE id = ?", [r.id]);
    assert.equal(row?.email, r.email, `id ${r.id}`);
  }
  assert.deepEqual(await f(pool, list(2, 100)), [{ id: 36, email: "c100@x.io" }, { id: 37, email: "c101@x.io" }]);
});
test("ריק, וכפול ← כלום לא נכנס", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  assert.deepEqual(await f({ query: () => { throw new Error("no"); } }, []), []);
  await assert.rejects(f(pool, [...list(3), { name: "x", email: "dana@example.com", city: "x" }]), /Duplicate/);
  await assert.rejects(f(pool, [...list(2), list(1)[0]]), /Duplicate/);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM customers"))[0].n, 5);
});
