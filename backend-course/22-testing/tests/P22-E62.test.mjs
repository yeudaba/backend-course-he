import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E62.ts", ["withRollback"])).withRollback;
const count = async (db) => (await db.rows("SELECT count(*)::int AS n FROM items"))[0].n;

test("מחזיר את התוצאה, ושום דבר לא נשמר", async (t) => {
  const withRollback = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE items (id serial PRIMARY KEY, name text NOT NULL)");
  const pool = db.pool(2);
  const result = await withRollback(pool, async (client) => {
    await client.query("INSERT INTO items (name) VALUES ('a'), ('b')");
    return (await client.query("SELECT count(*)::int AS n FROM items")).rows[0].n;
  });
  assert.equal(result, 2, "בתוך הטרנזקציה — רואים את השורות");
  assert.equal(await count(db), 0, "אחרי — ROLLBACK, הטבלה ריקה");
  assert.equal(pool.idleCount, pool.totalCount, "החיבור חזר ל־pool");
});
test("שגיאה ← ROLLBACK, ואותה שגיאה", async (t) => {
  const withRollback = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE items (id serial PRIMARY KEY, name text NOT NULL)");
  const pool = db.pool(1);
  const boom = new Error("הבדיקה נכשלה");
  await assert.rejects(withRollback(pool, async (client) => {
    await client.query("INSERT INTO items (name) VALUES ('a')");
    await new Promise((r) => setTimeout(r, 10));
    throw boom;
  }), (e) => e === boom);
  assert.equal(await count(db), 0);
  for (let i = 0; i < 3; i++) await withRollback(pool, async (c) => c.query("INSERT INTO items (name) VALUES ('x')"));
  assert.equal(await count(db), 0, "pool של חיבור אחד — עדיין עובד (release תמיד)");
  const r = await pool.query("SELECT count(*)::int AS n FROM items");
  assert.equal(r.rows[0].n, 0, "החיבור חזר בלי טרנזקציה פתוחה");
});
test("ROLLBACK רק אחרי ש־fn הסתיימה", async (t) => {
  const withRollback = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE items (id serial PRIMARY KEY, name text NOT NULL)");
  const pool = db.pool(2);
  const n = await withRollback(pool, async (client) => {
    await client.query("INSERT INTO items (name) VALUES ('a')");
    await new Promise((r) => setTimeout(r, 20));
    await client.query("INSERT INTO items (name) VALUES ('b')");
    return (await client.query("SELECT count(*)::int AS n FROM items")).rows[0].n;
  });
  assert.equal(n, 2, "שתי ההכנסות באותה טרנזקציה (return await)");
  assert.equal(await count(db), 0);
});
