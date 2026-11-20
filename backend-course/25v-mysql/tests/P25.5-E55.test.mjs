import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSameRows } from "../../tools/rows.mjs";
import { sameAsSolution } from "./_sqlcheck.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const EXTRA = `INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (1, 6, 3), (2, 1, 1); UPDATE products SET price = 31.50 WHERE id = 3`;
const FILE = "P25.5-E55.sql";

test("על נתוני היחידה", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE);
  assert.ok(expected.length > 0);
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assertSameRows(got, expected);
});
test("עם עוד נתונים — כדי שתשובה קבועה לא תעבור", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE, { extra: EXTRA });
  assertSameRows(got, expected);
});
test("רק העגלה של לקוח 1 מתרוקנת — עגלות של לקוחות אחרים נשארות", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query(EXTRA);
  const others = async () => (await db.rows("SELECT COUNT(*) AS n FROM cart_items WHERE customer_id <> 1"))[0].n;
  const before = await others();
  assert.ok(before > 0);
  await db.runFile(FILE);
  assert.equal(await others(), before, "DELETE בלי WHERE customer_id = 1 מוחק גם עגלות של אחרים");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM cart_items WHERE customer_id = 1"))[0].n, 0);
});
