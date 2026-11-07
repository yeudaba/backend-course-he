import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("בעלים ייחודי בלי תלות באותיות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E12.sql");
  await assert.rejects(db.query("INSERT INTO accounts (owner, balance) VALUES ('dana', 0)"), (e) => e.code === "23505");
  await assert.rejects(db.query("INSERT INTO accounts (owner, balance) VALUES ('AVI', 0)"), (e) => e.code === "23505");
  await db.query("INSERT INTO accounts (owner, balance) VALUES ('Danah', 0)");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM accounts"))[0].n, 5);
});
