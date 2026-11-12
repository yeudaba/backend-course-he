import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("כפילויות לפי email מנורמל", async (t) => {
  const db = await sandbox(t, import.meta.url, "interview.sql");
  assert.deepEqual(await db.fileRows("P27-E43.sql"), [
    { email: "avi@example.com", copies: 2, ids: [5, 7] },
    { email: "dana@example.com", copies: 2, ids: [1, 3] },
  ]);
  await db.query("INSERT INTO customers (name, email, city) VALUES ('x', 'Noa@Example.com ', 'Eilat'), ('y', 'unique@example.com', 'Eilat')");
  const rows = await db.fileRows("P27-E43.sql");
  assert.deepEqual(rows.map((r) => [r.email, r.copies]), [["avi@example.com", 2], ["dana@example.com", 2], ["noa@example.com", 2]]);
});
