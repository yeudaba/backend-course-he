import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E100.ts", ["changePassword"])).changePassword;
const NOW = new Date("2026-11-05T10:00:00.000Z");
const OLD = new Date("2026-11-01T00:00:00.000Z");

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  const h1 = await bcrypt.hash("old-password-1", 4);
  const h2 = await bcrypt.hash("yossi-password", 4);
  await db.query(`CREATE TABLE users (id serial PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL);
    CREATE TABLE refresh_tokens (id serial PRIMARY KEY, user_id int NOT NULL, token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz);`);
  await db.query("INSERT INTO users (email, password_hash) VALUES ('dana@example.com', $1), ('yossi@example.com', $2)", [h1, h2]);
  await db.query(`INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked_at) VALUES
    (1, 'a', '2026-11-12', NULL), (1, 'b', '2026-11-12', NULL), (1, 'c', '2026-11-12', $1), (2, 'd', '2026-11-12', NULL)`, [OLD]);
  return { db, pool: db.pool(2), h1 };
}
const tokens = async (db) => Object.fromEntries((await db.rows("SELECT token_hash, revoked_at FROM refresh_tokens")).map((r) => [r.token_hash, r.revoked_at]));
const hashOf = async (db, id) => (await db.rows("SELECT password_hash FROM users WHERE id = $1", [id]))[0].password_hash;

test("הצלחה", async (t) => {
  const changePassword = await get();
  const { db, pool } = await setup(t);
  assert.equal(await changePassword(pool, 1, "old-password-1", "new-password-1", 5, NOW), "OK");
  const h = await hashOf(db, 1);
  assert.equal(bcrypt.getRounds(h), 5);
  assert.ok(await bcrypt.compare("new-password-1", h));
  assert.deepEqual(await tokens(db), { a: NOW, b: NOW, c: OLD, d: null }, "של דנה — בוטלו (הישן לא נדרס), של יוסי — לא");
  assert.equal(pool.idleCount, pool.totalCount, "החיבור חזר ל־pool");
});
test("סיסמה שגויה / אין משתמש — כלום לא משתנה", async (t) => {
  const changePassword = await get();
  const { db, pool, h1 } = await setup(t);
  const before = await tokens(db);
  for (let i = 0; i < 4; i++) assert.equal(await changePassword(pool, 1, "wrong", "new-password-1", 4, NOW), "WRONG_PASSWORD");
  assert.equal(await changePassword(pool, 99, "x", "new-password-1", 4, NOW), "NOT_FOUND");
  assert.equal(await hashOf(db, 1), h1);
  assert.deepEqual(await tokens(db), before);
  assert.equal(pool.idleCount, pool.totalCount, "גם ביציאה מוקדמת — release (pool של 2 חיבורים, 5 קריאות)");
  const locks = await db.rows("SELECT count(*)::int AS n FROM pg_stat_activity WHERE state = 'idle in transaction' AND datname = current_database()");
  assert.equal(locks[0].n, 0, "אין טרנזקציה פתוחה שנשארה תלויה (ROLLBACK ביציאה מוקדמת)");
});
test("שגיאה באמצע ← ROLLBACK", async (t) => {
  const changePassword = await get();
  const { db, pool, h1 } = await setup(t);
  await db.query("DROP TABLE refresh_tokens");
  await assert.rejects(changePassword(pool, 1, "old-password-1", "new-password-1", 4, NOW), (e) => e.code === "42P01", "השגיאה נזרקת הלאה");
  assert.equal(await hashOf(db, 1), h1, "הסיסמה לא השתנתה — הכול או כלום");
  assert.equal(pool.idleCount, pool.totalCount);
});
