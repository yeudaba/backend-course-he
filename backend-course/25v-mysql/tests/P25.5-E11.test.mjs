import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

test("P25.5-E11: התוצאה (עמודות, שורות וסדר) — מול MySQL", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const got = await db.fileRows("P25.5-E11.sql");
  const expected = await db.expectedRows("P25.5-E11.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assert.deepEqual(got, expected);
});
