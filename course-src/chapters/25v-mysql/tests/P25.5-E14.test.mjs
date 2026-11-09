import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { concurrentClaim } from "./_claim.mjs";
import { seedJobs } from "./_jobs.mjs";

const { claimJobs } = await load(import.meta.url, "P25.5-E14.ts");

test("worker אחד: לפי סדר, ומסומן", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await seedJobs(db, 5);
  const pool = db.pool(2);
  assert.deepEqual(await claimJobs(pool, "w1", 3), [1, 2, 3]);
  assert.deepEqual(await claimJobs(pool, "w2", 3), [4, 5]);
  assert.deepEqual(await claimJobs(pool, "w2", 3), []);
  assert.deepEqual((await db.rows("SELECT locked_by FROM jobs ORDER BY id")).map((r) => r.locked_by), ["w1", "w1", "w1", "w2", "w2"]);
});
test("6 workers במקביל — בלי כפילויות", async (t) => {
  const { taken } = await concurrentClaim(t, import.meta.url, claimJobs);
  assert.ok(taken.length >= 30);
});
