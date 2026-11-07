import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("P17-E24: התוצאה (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  const got = await db.fileRows("P17-E24.sql");
  const expected = await db.expectedRows("P17-E24.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assert.deepEqual(got, expected);
});
