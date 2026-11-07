import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("P16-E25: התוצאה (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const got = await db.fileRows("P16-E25.sql");
  const expected = await db.expectedRows("P16-E25.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assert.deepEqual(got, expected);
});
