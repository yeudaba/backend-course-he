import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

async function setup(t) {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P25.5-E37.sql");
  await db.query("DELETE FROM tasks");
  return db;
}

test("ברירות מחדל", async (t) => {
  const db = await setup(t);
  const [r] = await db.query("INSERT INTO tasks (owner_id, title) VALUES (1, 'לקנות פילטרים')");
  assert.ok(r.insertId > 0, "id נוצר אוטומטית");
  const [row] = await db.rows("SELECT owner_id, title, done, due_date, tags, created_at FROM tasks WHERE id = ?", [r.insertId]);
  assert.equal(row.title, "לקנות פילטרים");
  assert.equal(Number(row.done), 0, "done — false");
  assert.equal(row.due_date, null);
  assert.deepEqual(row.tags, [], "tags — מערך ריק");
  assert.ok(row.created_at, "created_at — עכשיו");
  assert.match(String(row.created_at), /\.\d{3}$/, "created_at עם מילישניות (DATETIME(3))");
});
test("כותרת: 200 תווים בעברית — כן; 201 — לא", async (t) => {
  const db = await setup(t);
  await db.query("INSERT INTO tasks (owner_id, title) VALUES (1, ?)", ["א".repeat(200)]);
  await assert.rejects(db.query("INSERT INTO tasks (owner_id, title) VALUES (1, ?)", ["א".repeat(201)]), /too long|check/i);
  await db.query("INSERT INTO tasks (owner_id, title, tags) VALUES (1, 'עם אמוג׳י 🔥', ?)", ['["a","b"]']);
  await assert.rejects(db.query("INSERT INTO tasks (owner_id) VALUES (1)"), "title חובה");
});
test("JSON, FK ותאריך", async (t) => {
  const db = await setup(t);
  await assert.rejects(db.query("INSERT INTO tasks (owner_id, title, tags) VALUES (1, 'x', '{not json')"), /JSON/i);
  await assert.rejects(db.query("INSERT INTO tasks (owner_id, title) VALUES (999, 'x')"), /foreign key/i);
  await db.query("INSERT INTO tasks (owner_id, title, due_date, done) VALUES (2, 'y', '2026-11-05', TRUE)");
  const [row] = await db.rows("SELECT due_date, done FROM tasks WHERE owner_id = 2");
  assert.deepEqual([row.due_date, Number(row.done)], ["2026-11-05", 1]);
  const [cols] = await db.query("SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks' ORDER BY ORDINAL_POSITION");
  assert.deepEqual(cols.map((c) => c.COLUMN_NAME), ["id", "owner_id", "title", "done", "due_date", "tags", "created_at"]);
  assert.equal(cols.find((c) => c.COLUMN_NAME === "tags").DATA_TYPE, "json");
});
