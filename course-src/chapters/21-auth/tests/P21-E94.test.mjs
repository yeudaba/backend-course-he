import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E94.ts", ["seedUsers"])).seedUsers;
const USERS = [
  { email: "Dana@Example.com", password: "dana-password-1", role: "user" },
  { email: "yossi@example.com", password: "yossi-password-1", role: "user" },
  { email: "admin@example.com", password: "admin-password-1", role: "admin" },
];

test("זורע, ואפשר להריץ שוב", async (t) => {
  const seedUsers = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE users (id serial PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL, role text NOT NULL DEFAULT 'user')");
  assert.equal(await seedUsers(db.client, USERS, 4), 3);
  const rows = await db.rows("SELECT email, password_hash, role FROM users ORDER BY id");
  assert.deepEqual(rows.map((r) => [r.email, r.role]), [["dana@example.com", "user"], ["yossi@example.com", "user"], ["admin@example.com", "admin"]]);
  for (const [i, r] of rows.entries()) {
    assert.equal(bcrypt.getRounds(r.password_hash), 4);
    assert.ok(await bcrypt.compare(USERS[i].password, r.password_hash), `ה־hash של ${r.email} מתאים לסיסמה`);
  }
  assert.equal(await seedUsers(db.client, USERS, 4), 0, "הרצה שנייה — 0");
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM users"))[0].n, 3);
});
test("לא דורס משתמש קיים", async (t) => {
  const seedUsers = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE users (id serial PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL, role text NOT NULL DEFAULT 'user')");
  await db.query("INSERT INTO users (email, password_hash, role) VALUES ('yossi@example.com', 'changed-by-yossi', 'user')");
  assert.equal(await seedUsers(db.client, USERS, 4), 2);
  assert.equal((await db.rows("SELECT password_hash FROM users WHERE email = 'yossi@example.com'"))[0].password_hash, "changed-by-yossi");
  assert.equal(await seedUsers(db.client, [{ email: "NEW@x.co", password: "p-1234567", role: "user" }], 4), 1);
  assert.equal(await seedUsers(db.client, [], 4), 0);
});
