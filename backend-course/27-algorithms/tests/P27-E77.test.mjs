import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("מרוויחים לפחות כמו המנהל", async (t) => {
  const db = await sandbox(t, import.meta.url, "interview.sql");
  assert.deepEqual(await db.fileRows("P27-E77.sql"), [{ employee: "Shira", salary: 16000, manager: "Eli", manager_salary: 16000 }]);
  await db.query("UPDATE employees SET salary = 32000 WHERE name = 'Avi'; UPDATE employees SET salary = 45000 WHERE name = 'Noa'");
  assert.deepEqual((await db.fileRows("P27-E77.sql")).map((r) => [r.employee, r.manager]), [["Avi", "Yossi"], ["Noa", "Dana"], ["Shira", "Eli"]]);
});
