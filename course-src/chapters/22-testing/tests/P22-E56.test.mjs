import { test } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E56.ts", ["createTestDatabase"])).createTestDatabase;
const URL_ = process.env.COURSE_DATABASE_URL || "postgresql://localhost:5432/course";
const MIGRATIONS = [
  "CREATE TABLE users (id serial PRIMARY KEY, email text NOT NULL UNIQUE)",
  "CREATE TABLE tasks (id serial PRIMARY KEY, owner_id int NOT NULL REFERENCES users(id), title text NOT NULL)",
  "ALTER TABLE tasks ADD COLUMN done boolean NOT NULL DEFAULT false",
];
async function schemaExists(name) {
  const c = new pg.Client({ connectionString: URL_ });
  await c.connect();
  try {
    return (await c.query("SELECT 1 FROM pg_namespace WHERE nspname = $1", [name])).rowCount === 1;
  } finally {
    await c.end();
  }
}

test("בלי url ← שגיאה ברורה", async () => {
  const create = await get();
  await assert.rejects(create(undefined, MIGRATIONS), { message: "חסר DATABASE_URL_TEST" });
  await assert.rejects(create("", MIGRATIONS), { message: "חסר DATABASE_URL_TEST" });
});
test("schema, migrations לפי הסדר, reset ו־close", async (t) => {
  const create = await get();
  const db = await create(URL_, MIGRATIONS);
  let closed = false;
  t.after(async () => { if (!closed) await db.close().catch(() => {}); });
  assert.match(db.schema, /^test_[0-9a-f]{8}$/);
  assert.ok(await schemaExists(db.schema));
  const cols = await db.client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'tasks' ORDER BY ordinal_position", [db.schema]);
  assert.deepEqual(cols.rows.map((r) => r.column_name), ["id", "owner_id", "title", "done"], "שלושת ה־migrations רצו, לפי הסדר, ב־schema החדש");
  await db.client.query("INSERT INTO users (email) VALUES ('a@x.co'), ('b@x.co')");
  await db.client.query("INSERT INTO tasks (owner_id, title) VALUES (2, 'x')");
  await db.reset(["users", "tasks"]);
  assert.equal((await db.client.query("SELECT count(*)::int AS n FROM tasks")).rows[0].n, 0);
  const { rows } = await db.client.query("INSERT INTO users (email) VALUES ('c@x.co') RETURNING id");
  assert.equal(rows[0].id, 1, "RESTART IDENTITY — ה־ids מתחילים שוב מ־1");
  await db.reset(["users"]);
  assert.equal((await db.client.query("SELECT count(*)::int AS n FROM users")).rows[0].n, 0, "CASCADE — אפשר לרוקן users למרות ה־FK");
  const name = db.schema;
  await db.close();
  closed = true;
  assert.equal(await schemaExists(name), false, "close מוחק את ה־schema");
});
test("שני מסדים במקביל — לא רואים זה את זה", async (t) => {
  const create = await get();
  const [a, b] = await Promise.all([create(URL_, MIGRATIONS), create(URL_, MIGRATIONS)]);
  t.after(async () => { await a.close().catch(() => {}); await b.close().catch(() => {}); });
  assert.notEqual(a.schema, b.schema);
  await a.client.query("INSERT INTO users (email) VALUES ('only-a@x.co')");
  assert.equal((await b.client.query("SELECT count(*)::int AS n FROM users")).rows[0].n, 0);
  const pub = await a.client.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks'");
  void pub;
});
