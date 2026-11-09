import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

test("FULLTEXT: אינדקס, והתוצאה", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const got = await db.fileRows("P25.5-E16.sql");
  const expected = await db.expectedRows("P25.5-E16.sql");
  assert.deepEqual(got, expected);
  const idx = await db.rows("SELECT INDEX_TYPE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_TYPE = 'FULLTEXT'");
  assert.ok(idx.length > 0, "אינדקס FULLTEXT על products");
});
