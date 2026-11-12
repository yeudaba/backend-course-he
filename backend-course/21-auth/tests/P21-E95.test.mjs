import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, code } from "./_ts.mjs";

const FILE = "P21-E95.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["listTasks"])).listTasks;

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE tasks (id serial PRIMARY KEY, owner_id int NOT NULL, title text NOT NULL, status text NOT NULL, created_at timestamptz NOT NULL);
    CREATE INDEX ON tasks (owner_id, status, created_at);
    INSERT INTO tasks (owner_id, title, status, created_at) VALUES
      (1, 'א', 'todo', '2026-11-01T10:00Z'), (1, 'ב', 'done', '2026-11-03T10:00Z'), (2, 'של יוסי', 'todo', '2026-11-05T10:00Z'),
      (1, 'ג', 'todo', '2026-11-03T10:00Z'), (1, 'ד', 'todo', '2026-11-04T10:00Z'), (1, 'ה', 'done', '2026-10-30T10:00Z');`);
  return db;
}

test("רק של הבעלים, מיון וספירה", async (t) => {
  const listTasks = await get();
  const db = await setup(t);
  const r = await listTasks(db.client, 1, { limit: 10, offset: 0 });
  assert.deepEqual(r.data.map((x) => x.title), ["ד", "ג", "ב", "א", "ה"], "created_at מהחדש, ובשוויון — id מהגדול");
  assert.deepEqual(r.data[0], { id: 5, title: "ד", status: "todo" });
  assert.strictEqual(r.total, 5, "total כמספר (::int)");
  const y = await listTasks(db.client, 2, { limit: 10, offset: 0 });
  assert.deepEqual(y, { data: [{ id: 3, title: "של יוסי", status: "todo" }], total: 1 });
  assert.deepEqual(await listTasks(db.client, 9, { limit: 10, offset: 0 }), { data: [], total: 0 });
});
test("status ועמודים", async (t) => {
  const listTasks = await get();
  const db = await setup(t);
  const todo = await listTasks(db.client, 1, { status: "todo", limit: 2, offset: 0 });
  assert.deepEqual(todo.data.map((x) => x.title), ["ד", "ג"]);
  assert.equal(todo.total, 3, "total לפני LIMIT");
  const page2 = await listTasks(db.client, 1, { status: "todo", limit: 2, offset: 2 });
  assert.deepEqual(page2.data.map((x) => x.title), ["א"]);
  const done = await listTasks(db.client, 1, { status: "done", limit: 10, offset: 0 });
  assert.deepEqual(done, { data: [{ id: 2, title: "ב", status: "done" }, { id: 6, title: "ה", status: "done" }], total: 2 });
});
test("פרמטרים", () => {
  const src = code(import.meta.url, FILE);
  assert.doesNotMatch(src, /\$\{\s*(opts\.)?(status|limit|offset|ownerId)\s*\}/, "בלי הדבקת ערכים ל־SQL — LIMIT $3 OFFSET $4");
});
