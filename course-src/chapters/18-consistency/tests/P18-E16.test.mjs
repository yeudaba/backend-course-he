import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("indexes ל־foreign keys", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E16.sql");
  const defs = (await db.rows("SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'transfers'")).map((r) => r.indexdef);
  assert.ok(defs.some((d) => /\(from_id[,)]/.test(d)), "index שמתחיל ב־from_id");
  assert.ok(defs.some((d) => /\(to_id[,)]/.test(d)), "index שמתחיל ב־to_id");
});
