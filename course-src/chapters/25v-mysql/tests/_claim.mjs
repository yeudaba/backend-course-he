import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { seedJobs } from "./_jobs.mjs";

// 6 workers במקביל, 3 סבבים של עד 4 עבודות — כל עבודה פעם אחת בדיוק
export async function concurrentClaim(t, testUrl, claimJobs) {
  const db = await mysqlSandbox(t, testUrl, "shop.sql");
  await seedJobs(db, 40);
  const pool = db.pool(10);
  const taken = [];
  await Promise.all(Array.from({ length: 6 }, async (_, w) => {
    for (let round = 0; round < 3; round++) taken.push(...(await claimJobs(pool, `w${w}`, 4)));
  }));
  assert.equal(new Set(taken).size, taken.length, "אותה עבודה נלקחה פעמיים");
  const rows = await db.rows("SELECT id, status, locked_by FROM jobs WHERE status = 'running' ORDER BY id");
  assert.deepEqual(rows.map((r) => r.id).sort((a, b) => a - b), [...taken].sort((a, b) => a - b));
  return { db, pool, taken };
}
