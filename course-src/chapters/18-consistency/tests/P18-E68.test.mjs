import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sandbox } from "../../tools/sql.mjs";
import { plan, lastStatement } from "./_helpers.mjs";
import { target } from "../../tools/load.mjs";

test("P18-E68: הדוח והתוכנית", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const got = await db.fileRows("P18-E68.sql");
  const expected = await db.expectedRows("P18-E68.sql");
  assert.deepEqual(Object.keys(got?.[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן (day, orders, revenue)");
  assert.deepEqual(got, expected);
  const query = lastStatement(fs.readFileSync(target(import.meta.url, "P18-E68.sql"), "utf8"));
  const p = await plan(db, query);
  assert.match(p, /Index|Bitmap/, `השאילתה צריכה להשתמש ב־index. התוכנית:\n${p}`);
  assert.doesNotMatch(p, /Seq Scan on big_orders/, `בלי Seq Scan על big_orders. התוכנית:\n${p}`);
});
