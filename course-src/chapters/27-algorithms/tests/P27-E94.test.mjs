import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { sql } = await load(import.meta.url, "P27-E94.ts");

test("פרמטרים ומערכים", () => {
  const email = "dana@example.com";
  assert.deepEqual(sql`SELECT * FROM users WHERE email = ${email} AND age > ${18}`, { text: "SELECT * FROM users WHERE email = $1 AND age > $2", values: [email, 18] });
  assert.deepEqual(sql`SELECT 1`, { text: "SELECT 1", values: [] });
  assert.deepEqual(sql`WHERE a = ${1} AND id IN (${[5, 6, 7]}) AND b = ${"x"}`, { text: "WHERE a = $1 AND id IN ($2, $3, $4) AND b = $5", values: [1, 5, 6, 7, "x"] });
  assert.throws(() => sql`WHERE id IN (${[]})`);
});
test("מול PostgreSQL: injection לא עובד", async (t) => {
  const db = await sandbox(t, import.meta.url, "interview.sql");
  const evil = "x' OR '1'='1";
  const q = sql`SELECT name FROM customers WHERE email = ${evil}`;
  assert.ok(!q.text.includes("OR"), "הערך לא בטקסט");
  assert.deepEqual((await db.query(q.text, q.values)).rows, []);
  const drop = "'; DROP TABLE customers; --";
  const q2 = sql`SELECT name FROM customers WHERE city = ${drop} OR id IN (${[1, 2]}) ORDER BY id`;
  assert.deepEqual((await db.query(q2.text, q2.values)).rows.map((r) => r.name), ["Dana Levi", "Yossi Cohen"]);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM customers")).rows[0].n, 8, "הטבלה עדיין קיימת");
});
