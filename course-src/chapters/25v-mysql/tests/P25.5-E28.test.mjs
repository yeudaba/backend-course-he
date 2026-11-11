import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const FILE = "P25.5-E28.ts";
async function get() {
  const mod = await load(import.meta.url, FILE);
  if (typeof mod.pgToMysql !== "function") assert.fail(`הקובץ ${FILE} לא מייצא את pgToMysql. כתוב export לפני ההגדרה: export function pgToMysql(...)`);
  return mod.pgToMysql;
}

test("$n ← ?, והפרמטרים לפי סדר ההופעה", async () => {
  const pgToMysql = await get();
  assert.deepEqual(pgToMysql("SELECT * FROM t WHERE a = $1 AND b = $2", [1, 2]), { sql: "SELECT * FROM t WHERE a = ? AND b = ?", params: [1, 2] });
  assert.deepEqual(pgToMysql("WHERE c = $2 AND p < $1 OR n = $2", [100, "beans"]), { sql: "WHERE c = ? AND p < ? OR n = ?", params: ["beans", 100, "beans"] }, "$2 שמופיע פעמיים — הפרמטר פעמיים");
  assert.deepEqual(pgToMysql("LIMIT $10 OFFSET $1", [0, 2, 3, 4, 5, 6, 7, 8, 9, 50]), { sql: "LIMIT ? OFFSET ?", params: [50, 0] }, "$10 הוא פרמטר 10, לא $1 ואחריו 0");
  assert.deepEqual(pgToMysql("SELECT 1", []), { sql: "SELECT 1", params: [] });
});
test("\"שם\" ← `שם`, ובתוך מחרוזת '...' לא נוגעים", async () => {
  const pgToMysql = await get();
  assert.deepEqual(pgToMysql('SELECT "order", "group" FROM "items"', []).sql, "SELECT `order`, `group` FROM `items`");
  assert.deepEqual(pgToMysql("SELECT 'cost: $1' AS a, $1 AS b", [5]), { sql: "SELECT 'cost: $1' AS a, ? AS b", params: [5] }, "$1 בתוך מחרוזת הוא טקסט");
  assert.deepEqual(pgToMysql("SELECT 'it''s \"x\" $2', $1", [1, 2]), { sql: "SELECT 'it''s \"x\" $2', ?", params: [1] }, "'' בתוך מחרוזת הוא גרש, והמחרוזת ממשיכה");
});
test("$n שאין לו פרמטר ← RangeError", async () => {
  const pgToMysql = await get();
  assert.throws(() => pgToMysql("SELECT $3", [1, 2]), RangeError);
  assert.throws(() => pgToMysql("SELECT $0", [1]), RangeError);
});
test("רץ על MySQL אמיתי", async (t) => {
  const pgToMysql = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const { sql, params } = pgToMysql(`SELECT "name", 'a$1''b' AS note FROM products WHERE category = $2 AND price < $1 AND stock > 0 ORDER BY "name"`, [150, "brewing"]);
  const rows = await db.rows(sql, params);
  assert.deepEqual(rows.map((r) => r.name), ["French Press 1L", "Moka Pot 6 Cups"]);
  assert.equal(rows[0].note, "a$1'b");
});
