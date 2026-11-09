import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

async function setup(t) {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P25.5-E23.sql");
  return db;
}
test("אמוג׳י ב־bio", async (t) => {
  const db = await setup(t);
  await db.query("INSERT INTO members (name, bio) VALUES ('Dana', 'אוהבת קפה ☕🔥')");
  assert.equal((await db.rows("SELECT bio FROM members"))[0].bio, "אוהבת קפה ☕🔥");
});
test("יתרה מדויקת", async (t) => {
  const db = await setup(t);
  await db.query("INSERT INTO members (name, bio, balance) VALUES ('Dana', 'x', 89.90), ('Yossi', 'y', 0.10), ('Noa', 'z', 0.20)");
  const [{ s }] = await db.rows("SELECT CAST(SUM(balance) AS CHAR) s FROM members");
  assert.equal(s, "90.20");
});
test("תאריך לידה לפני 1970", async (t) => {
  const db = await setup(t);
  await db.query("INSERT INTO members (name, bio, birth_date) VALUES ('Avi', 'x', '1965-05-01')");
  assert.equal((await db.rows("SELECT CAST(birth_date AS CHAR) d FROM members"))[0].d.slice(0, 10), "1965-05-01");
});
