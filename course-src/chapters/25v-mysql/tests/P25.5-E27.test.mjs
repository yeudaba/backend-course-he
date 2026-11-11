import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const FILE = "P25.5-E27.ts";
async function get() {
  const mod = await load(import.meta.url, FILE);
  if (typeof mod.buildBulkInsert !== "function") assert.fail(`הקובץ ${FILE} לא מייצא את buildBulkInsert. כתוב export לפני ההגדרה: export function buildBulkInsert(...)`);
  return mod.buildBulkInsert;
}

test("SQL ופרמטרים — בסדר העמודות של השורה הראשונה", async () => {
  const build = await get();
  const r = build("cart_items", [
    { customer_id: 1, product_id: 3, quantity: 2 },
    { product_id: 4, customer_id: 1, quantity: 1 },
  ]);
  assert.equal(r.sql, "INSERT INTO `cart_items` (`customer_id`, `product_id`, `quantity`) VALUES (?, ?, ?), (?, ?, ?)");
  assert.deepEqual(r.params, [1, 3, 2, 1, 4, 1], "בשורה השנייה המפתחות בסדר אחר — הפרמטרים לפי סדר העמודות, לא לפי סדר המפתחות בשורה");
});
test("upsert: add ו־set", async () => {
  const build = await get();
  const r = build("products", [{ id: 1, name: "x", stock: 5 }], { add: ["stock"], set: ["name"] });
  assert.equal(r.sql, "INSERT INTO `products` (`id`, `name`, `stock`) VALUES (?, ?, ?) AS new ON DUPLICATE KEY UPDATE `stock` = `products`.`stock` + new.`stock`, `name` = new.`name`");
});
test("קלט לא תקין ← Error", async () => {
  const build = await get();
  assert.throws(() => build("t", []), Error, "אין שורות");
  assert.throws(() => build("t", [{ a: 1 }, { b: 1 }]), Error, "עמודות שונות");
  assert.throws(() => build("t", [{ a: 1, b: 2 }, { a: 1 }]), Error, "עמודה חסרה בשורה השנייה");
  assert.throws(() => build("products; DROP TABLE orders", [{ a: 1 }]), Error, "שם טבלה לא חוקי");
  assert.throws(() => build("t", [{ "a`); DROP TABLE x; --": 1 }]), Error, "שם עמודה לא חוקי");
  assert.throws(() => build("t", [{ a: 1 }], { add: ["a = 0, b"] }), Error, "שם לא חוקי ב־add");
});
test("רץ על MySQL אמיתי: עגלה עם upsert, וערכים מסוכנים נשארים ערכים", async (t) => {
  const build = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const { sql, params } = build("cart_items", [
    { customer_id: 1, product_id: 3, quantity: 2 },
    { customer_id: 1, product_id: 4, quantity: 1 },
  ], { add: ["quantity"] });
  await db.query(sql, params);
  const rows = await db.rows("SELECT product_id, quantity FROM cart_items WHERE customer_id = 1 ORDER BY product_id");
  assert.deepEqual(rows.map((r) => [r.product_id, r.quantity]), [[3, 4], [4, 1], [9, 1]], "מוצר 3 היה בעגלה עם 2 ← 4; מוצר 4 חדש");
  const evil = build("customers", [{ name: "x'); DROP TABLE orders; --", email: "e@x.com", city: "Eilat" }]);
  await db.query(evil.sql, evil.params);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM orders"))[0].n, 6, "הטבלה orders עדיין קיימת — הערכים עוברים כפרמטרים");
});
