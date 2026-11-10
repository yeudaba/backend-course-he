import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const FILE = "P25.5-E26.sql";
const COLS = ["name", "city", "orders", "spent", "last_order", "cart_units", "city_rank"];
// mysql2 מחזיר DECIMAL כמחרוזת ("278.90"); COUNT כמספר. משווים כמספרים
const norm = (rows) => rows.map((r) => ({ ...r, orders: Number(r.orders), spent: Number(r.spent), cart_units: Number(r.cart_units), city_rank: Number(r.city_rank) }));

test("P25.5-E26: העמודות, השורות והסדר — מול MySQL", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const got = await db.fileRows(FILE);
  assert.deepEqual(Object.keys(got[0] ?? {}), COLS, "שמות העמודות והסדר שלהן");
  assert.equal(got.length, 5, "כל הלקוחות — גם מי שלא הזמין (LEFT JOIN)");
  const maya = got.find((r) => r.name === "Maya Katz");
  assert.equal(Number(maya.spent), 0, "לקוחה בלי הזמנות: spent הוא 0, לא NULL (IFNULL)");
  assert.equal(maya.last_order, null);
  const dana = got.find((r) => r.name === "Dana Levi");
  assert.equal(Number(dana.spent), 278.9, "רק paid ו־shipped. אם יצא 557.80 — ה־JOIN לעגלה הכפיל את ההזמנות: סכם כל טבלה בנפרד (CTE)");
  assert.equal(Number(dana.cart_units), 3, "cart_units = סכום הכמויות בעגלה");
  assert.equal(dana.last_order, "01/03/2026", "DATE_FORMAT(..., '%d/%m/%Y')");
  assert.deepEqual(norm(got), norm(await db.expectedRows(FILE)));
});
test("P25.5-E26: הזמנה נוספת, ותיקו בעיר", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query("INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'shipped', 100.00, '2026-03-20 08:00:00'), (5, 'cancelled', 999.00, '2026-03-21 08:00:00')");
  await db.query("INSERT INTO customers (name, email, city, created_at) VALUES ('Eli Bar', 'eli@example.com', 'Jerusalem', '2026-03-01 08:00:00')");
  await db.query("INSERT INTO orders (customer_id, status, total, created_at) SELECT id, 'paid', 119.00, '2026-03-22 08:00:00' FROM customers WHERE email = 'eli@example.com'");
  const got = norm(await db.fileRows(FILE));
  const dana = got.find((r) => r.name === "Dana Levi");
  assert.deepEqual([dana.orders, dana.spent, dana.last_order], [2, 378.9, "20/03/2026"]);
  assert.equal(got.find((r) => r.name === "Maya Katz").spent, 0, "הזמנה מבוטלת לא נספרת");
  const jlm = got.filter((r) => r.city === "Jerusalem");
  assert.deepEqual(jlm.map((r) => [r.name, r.city_rank]), [["Avi Peretz", 1], ["Eli Bar", 1]], "תיקו — אותו דירוג (RANK), ובתוך תיקו לפי שם");
});
