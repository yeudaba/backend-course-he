import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.5-E98.ts", ["toMysqlValue", "pgRowToMysql"]);

test("toMysqlValue", async () => {
  const { toMysqlValue } = await get();
  assert.equal(toMysqlValue(true), 1);
  assert.equal(toMysqlValue(false), 0);
  assert.equal(toMysqlValue(new Date("2026-11-04T22:30:00.123Z")), "2026-11-04 22:30:00.123");
  assert.equal(toMysqlValue(12345678901234567890n), "12345678901234567890");
  assert.equal(toMysqlValue({ a: [1, "ב"] }), '{"a":[1,"ב"]}');
  assert.equal(toMysqlValue([1, 2]), "[1,2]");
  assert.equal(toMysqlValue("1234567890123.45"), "1234567890123.45", "numeric נשאר מחרוזת");
  assert.equal(toMysqlValue(7), 7);
  assert.equal(toMysqlValue(null), null);
  assert.equal(toMysqlValue(undefined), null);
});
test("נכנס ל־MySQL וחוזר זהה", async (t) => {
  const { pgRowToMysql } = await get();
  const db = await mysqlSandbox(t, import.meta.url);
  await db.query("CREATE TABLE c (id INT PRIMARY KEY, active BOOLEAN, balance DECIMAL(20,2), created_at DATETIME(3), meta JSON, name VARCHAR(50), note TEXT)");
  const row = pgRowToMysql({ id: 1, active: true, balance: "123456789012345678.91", created_at: new Date("2026-03-27T00:30:00.456Z"), meta: { tags: ["a"], n: 1 }, name: "דנה 🔥", note: undefined });
  await db.query("INSERT INTO c SET ?", [row]);
  const [back] = await db.rows("SELECT active, CAST(balance AS CHAR) AS balance, created_at, meta, name, note FROM c");
  assert.deepEqual(back, { active: 1, balance: "123456789012345678.91", created_at: "2026-03-27 00:30:00.456", meta: { tags: ["a"], n: 1 }, name: "דנה 🔥", note: null });
});
