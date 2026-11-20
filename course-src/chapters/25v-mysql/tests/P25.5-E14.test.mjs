import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { concurrentClaim } from "./_claim.mjs";
import { seedJobs } from "./_jobs.mjs";

const { claimJobs } = await load(import.meta.url, "P25.5-E14.ts");
const within = (p, ms, msg) => { let timer; return Promise.race([p, new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(msg)), ms); })]).finally(() => clearTimeout(timer)); };

test("worker אחד: לפי סדר, ומסומן", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await seedJobs(db, 5);
  const pool = db.pool(2);
  assert.deepEqual(await within(claimJobs(pool, "w1", 3), 3000, "claimJobs נתקע — החיבור לא חזר ל־pool (release ב־finally?)"), [1, 2, 3]);
  assert.deepEqual(await within(claimJobs(pool, "w2", 3), 3000, "claimJobs נתקע — החיבור לא חזר ל־pool (release ב־finally?)"), [4, 5]);
  assert.deepEqual(await within(claimJobs(pool, "w2", 3), 3000, "claimJobs נתקע — החיבור לא חזר ל־pool (release ב־finally?)"), []);
  assert.deepEqual((await db.rows("SELECT locked_by FROM jobs ORDER BY id")).map((r) => r.locked_by), ["w1", "w1", "w1", "w2", "w2"]);
});
test("6 workers במקביל — בלי כפילויות", async (t) => {
  const { taken } = await concurrentClaim(t, import.meta.url, claimJobs);
  assert.ok(taken.length >= 30);
});
test("job נעול בידי worker אחר — מדלגים עליו, לא מחכים", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await seedJobs(db, 5);
  const pool = db.pool(3);
  const other = await pool.getConnection();
  await other.beginTransaction();
  await other.query("SELECT id FROM jobs WHERE id = 1 FOR UPDATE");
  try {
    const r = await within(claimJobs(pool, "w1", 2), 3000, "claimJobs חיכה לנעילה של worker אחר — חסר SKIP LOCKED");
    assert.deepEqual(r, [2, 3]);
  } finally {
    await other.rollback();
    other.release();
  }
});
