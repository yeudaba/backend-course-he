import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("העץ תחת Dana, עם עומק", async (t) => {
  const db = await sandbox(t, import.meta.url, "interview.sql");
  assert.deepEqual(await db.fileRows("P27-E66.sql"), [
    { name: "Dana", depth: 0 },
    { name: "Noa", depth: 1 },
    { name: "Yossi", depth: 1 },
    { name: "Avi", depth: 2 },
  ]);
  await db.query("INSERT INTO employees (name, department, salary, manager_id) VALUES ('Lior', 'engineering', 20000, 4), ('Gal', 'engineering', 20000, 9)");
  const rows = await db.fileRows("P27-E66.sql");
  assert.deepEqual(rows.at(-1), { name: "Lior", depth: 3 }, "עומק 3 — רקורסיה, לא JOIN קבוע");
  assert.equal(rows.length, 5, "Gal תחת Shira — לא בעץ של Dana");
});
