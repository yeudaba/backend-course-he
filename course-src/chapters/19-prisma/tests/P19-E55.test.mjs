import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E55: SetNull על שדה לא חובה", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E55.prisma");
  assert.deepEqual(await columns(db, "employees"), { id: "integer NOT NULL DEFAULT autoincrement", name: "text NOT NULL" });
  assert.deepEqual(await columns(db, "tasks"), { assignee_id: "integer", id: "integer NOT NULL DEFAULT autoincrement", title: "text NOT NULL" });
  await db.query("INSERT INTO employees (name) VALUES ('Dana'), ('Yossi')");
  await db.query("INSERT INTO tasks (title, assignee_id) VALUES ('a', 1), ('b', 1), ('c', 2), ('d', NULL)");
  await assert.rejects(db.query("INSERT INTO tasks (title, assignee_id) VALUES ('x', 9)"), undefined, "עובד שלא קיים");
  try {
    await db.query("DELETE FROM employees WHERE id = 1");
  } catch (err) {
    assert.fail(`מחיקת עובד נכשלה: ${err.message}`);
  }
  assert.deepEqual(await db.rows("SELECT title, assignee_id FROM tasks ORDER BY id"), [
    { title: "a", assignee_id: null }, { title: "b", assignee_id: null }, { title: "c", assignee_id: 2 }, { title: "d", assignee_id: null },
  ], "המשימות נשארו, בלי אחראי");
  const idx = await db.rows("SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'tasks' AND indexdef LIKE '%(assignee_id)%'");
  assert.equal(idx.length, 1, "index על assignee_id");
});
