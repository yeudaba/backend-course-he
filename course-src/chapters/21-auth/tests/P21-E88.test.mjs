import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const SETUP = `CREATE TABLE users (id serial PRIMARY KEY, email text NOT NULL UNIQUE);
CREATE TABLE tasks (id serial PRIMARY KEY, title text NOT NULL);
INSERT INTO users (email) VALUES ('dana@example.com'), ('yossi@example.com'), ('admin@example.com'), ('legacy@tasks.example'), ('noa@example.com');
INSERT INTO tasks (title) VALUES ('לקנות חלב'), ('לשלם חשמל'), ('להתקשר לסבתא'), ('לתקן את הברז');`;

async function migrated(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(SETUP);
  await db.runFile("P21-E88.sql");
  return db;
}

test("העמודה: int, NOT NULL", async (t) => {
  const db = await migrated(t);
  const cols = await db.rows("SELECT data_type, is_nullable FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'tasks' AND column_name = 'owner_id'", [db.schema]);
  assert.equal(cols.length, 1, "אין עמודה owner_id בטבלה tasks");
  assert.equal(cols[0].data_type, "integer");
  assert.equal(cols[0].is_nullable, "NO", "owner_id חייב להיות NOT NULL בסוף");
});
test("כל המשימות של legacy, ושום דבר לא נמחק", async (t) => {
  const db = await migrated(t);
  const rows = await db.rows("SELECT t.title, u.email FROM tasks t JOIN users u ON u.id = t.owner_id ORDER BY t.id");
  assert.equal(rows.length, 4, "ארבע המשימות עדיין שם");
  assert.ok(rows.every((r) => r.email === "legacy@tasks.example"), "כל המשימות שייכות ל־legacy@tasks.example (ה־id שלו 4, לא 1)");
});
test("foreign key עם ON DELETE CASCADE, ואינדקס", async (t) => {
  const db = await migrated(t);
  const fk = await db.rows(
    `SELECT confdeltype FROM pg_constraint c JOIN pg_class r ON r.oid = c.conrelid JOIN pg_namespace n ON n.oid = r.relnamespace
      WHERE n.nspname = $1 AND r.relname = 'tasks' AND c.contype = 'f'`, [db.schema]);
  assert.equal(fk.length, 1, "foreign key מ־tasks.owner_id ל־users(id)");
  assert.equal(fk[0].confdeltype, "c", "ON DELETE CASCADE");
  await assert.rejects(db.query("INSERT INTO tasks (title, owner_id) VALUES ('x', 999)"), (e) => e.code === "23503", "owner_id שלא קיים ב־users ← שגיאה");
  await db.query("DELETE FROM users WHERE email = 'legacy@tasks.example'");
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM tasks"))[0].n, 0, "מחיקת המשתמש מחקה את המשימות שלו");
  const idx = await db.rows("SELECT indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = 'tasks'", [db.schema]);
  assert.ok(idx.some((i) => /\(owner_id\)/.test(i.indexdef)), "אינדקס על tasks (owner_id)");
});
