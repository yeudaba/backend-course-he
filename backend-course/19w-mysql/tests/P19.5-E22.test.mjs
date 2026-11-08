import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { concurrentClaim } from "./_claim.mjs";
import { seedJobs } from "./_jobs.mjs";

const { claimJobs } = await load(import.meta.url, "P19.5-E22.ts");

test("עד limit — לא כל התור", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await seedJobs(db, 6);
  const pool = db.pool(2);
  assert.deepEqual(await claimJobs(pool, "w1", 3), [1, 2, 3]);
  assert.deepEqual(await claimJobs(pool, "w2", 3), [4, 5, 6]);
});
test("6 workers במקביל — בלי כפילויות", async (t) => {
  await concurrentClaim(t, import.meta.url, claimJobs);
});
