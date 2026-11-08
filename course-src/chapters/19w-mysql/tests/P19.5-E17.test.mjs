import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { once, InProgress } = await load(import.meta.url, "P19.5-E17.ts");
const TABLE = "CREATE TABLE idempotency (idem_key VARCHAR(100) PRIMARY KEY, status ENUM('pending','done') NOT NULL, result JSON NULL)";

test("פעם אחת; החוזרת מקבלת את אותה תוצאה", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query(TABLE);
  const pool = db.pool(5);
  let runs = 0;
  const fn = async () => ({ orderId: ++runs * 100 });
  assert.deepEqual(await once(pool, "k1", fn), { result: { orderId: 100 }, replayed: false });
  assert.deepEqual(await once(pool, "k1", fn), { result: { orderId: 100 }, replayed: true });
  assert.equal(runs, 1);
});
test("במקביל — fn רצה פעם אחת; האחרות: InProgress או replay", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query(TABLE);
  const pool = db.pool(10);
  let runs = 0;
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => once(pool, "k2", async () => { runs++; await new Promise((r) => setTimeout(r, 100)); return { ok: true }; })));
  assert.equal(runs, 1);
  for (const r of results) if (r.status === "rejected") assert.ok(r.reason instanceof InProgress);
});
test("fn נכשל ← אפשר לנסות שוב עם אותו מפתח", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query(TABLE);
  const pool = db.pool(2);
  await assert.rejects(once(pool, "k3", async () => { throw new Error("payment gateway down"); }));
  assert.deepEqual(await once(pool, "k3", async () => 7), { result: 7, replayed: false });
});
