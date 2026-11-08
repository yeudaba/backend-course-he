import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("P27-E12: התוצאה (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "interview.sql");
  const got = await db.fileRows("P27-E12.sql");
  assert.deepEqual(got, [{ second_salary: 31000 }], "עמודה second_salary עם המשכורת השנייה בגובהה — בלי כפילויות (31000 מופיע פעמיים)");
  await db.query("DELETE FROM employees WHERE salary < 42000");
  const empty = await db.fileRows("P27-E12.sql");
  assert.deepEqual(empty, [{ second_salary: null }], "כשיש רק משכורת אחת — שורה אחת עם NULL, לא אפס שורות");
});
