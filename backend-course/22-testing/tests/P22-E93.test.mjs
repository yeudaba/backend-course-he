import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E93.ts", ["applyMigrations"])).applyMigrations;
function dir(t, files) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "p22-e93-"));
  t.after(() => fs.rmSync(d, { recursive: true, force: true }));
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true });
    fs.writeFileSync(path.join(d, rel), text);
  }
  return d;
}

test("לפי סדר השמות, מדלג על מה שלא migration", async (t) => {
  const applyMigrations = await get();
  const db = await sandbox(t, import.meta.url);
  const d = dir(t, {
    "20261107055700_add_users/migration.sql": "CREATE TABLE users (id serial PRIMARY KEY, email text NOT NULL); ALTER TABLE tasks ADD COLUMN owner_id int REFERENCES users(id);",
    "20261101090000_init/migration.sql": "CREATE TABLE tasks (id serial PRIMARY KEY, title text NOT NULL);",
    "20261110120000_due/migration.sql": "ALTER TABLE tasks ADD COLUMN due_date date;",
    "20261105000000_empty_dir/README.md": "אין כאן migration",
    "migration_lock.toml": 'provider = "postgresql"',
  });
  const names = await applyMigrations(db.client, d);
  assert.deepEqual(names, ["20261101090000_init", "20261107055700_add_users", "20261110120000_due"]);
  const cols = await db.rows("SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'tasks' ORDER BY ordinal_position", [db.schema]);
  assert.deepEqual(cols.map((c) => c.column_name), ["id", "title", "owner_id", "due_date"]);
});
test("ברצף — לא במקביל", async (t) => {
  const applyMigrations = await get();
  const log = [];
  let running = 0;
  const client = { query: async (sql) => { running++; assert.equal(running, 1, "שתי migrations רצו במקביל"); await new Promise((r) => setTimeout(r, 10)); log.push(sql.trim()); running--; } };
  const d = dir(t, { "2_b/migration.sql": "B", "1_a/migration.sql": "A", "3_c/migration.sql": "C" });
  assert.deepEqual(await applyMigrations(client, d), ["1_a", "2_b", "3_c"]);
  assert.deepEqual(log, ["A", "B", "C"]);
});
test("אין migrations ← שגיאה", async (t) => {
  const applyMigrations = await get();
  const d = dir(t, { "migration_lock.toml": "x", "x/notes.txt": "y" });
  await assert.rejects(applyMigrations({ query: async () => {} }, d), { message: `אין migrations ב־${d}` });
});
