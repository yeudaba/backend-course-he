import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox, sameAsSolution } from "../../tools/sql.mjs";
import { assertSameRows } from "../../tools/rows.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lastStatement, plan } from "./_helpers.mjs";

test("אותה תוצאה, עם index", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const got = await db.fileRows("P18-E22.sql");
  assertSameRows(got, await db.expectedRows("P18-E22.sql"));
  await sameAsSolution(t, import.meta.url, "P18-E22.sql", { seed: "bank.sql", base: false, shuffle: false }); // גם עם הזמנות בדיוק בחצות
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", process.env.CHECK_TARGET || "starter", "P18-E22.sql");
  const p = await plan(db, lastStatement(fs.readFileSync(file, "utf8")));
  assert.match(p, /Index/, `השאילתה צריכה להשתמש ב־index. התוכנית:\n${p}`);
  assert.doesNotMatch(p, /Seq Scan/, p);
});
