import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P17-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["revenueByCity"])).revenueByCity;

test("עובר בדיקת טיפוסים, ומייצא את הטיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { revenueByCity, type Customer, type Order, type OrderItem, type CityRevenue } from "FILE";
const c: Customer = { id: 1, full_name: "a", city: null };
const o: Order = { id: 1, customer_id: 1, status: "paid" };
const i: OrderItem = { order_id: 1, quantity: 1, unit_price: 1 };
const r: CityRevenue[] = revenueByCity([c], [o], [i]);
// @ts-expect-error — city הוא string | null, לא number
const bad: Customer = { id: 1, full_name: "a", city: 5 };
`);
  assert.ok(p.ok, p.message);
});
test("אותה תוצאה כמו P17-E12 על store.sql", async (t) => {
  const revenueByCity = await get();
  const db = await sandbox(t, import.meta.url, "store.sql");
  const customers = await db.rows("SELECT id, full_name, city FROM customers");
  const orders = await db.rows("SELECT id, customer_id, status FROM orders");
  const items = await db.rows("SELECT order_id, quantity, unit_price FROM order_items");
  const expected = await db.rows(`SELECT COALESCE(c.city, 'unknown') AS city, SUM(oi.quantity * oi.unit_price) AS revenue
    FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status <> 'cancelled' GROUP BY 1 ORDER BY revenue DESC, city`);
  assert.deepEqual(revenueByCity(customers, orders, items), expected);
});
test("דיוק, עיר חסרה, תיקו ומבוטלות", async () => {
  const revenueByCity = await get();
  const customers = [
    { id: 1, full_name: "A", city: "Haifa" },
    { id: 2, full_name: "B", city: null },
    { id: 3, full_name: "C", city: "Acre" },
  ];
  const orders = [
    { id: 10, customer_id: 1, status: "paid" },
    { id: 11, customer_id: 2, status: "pending" },
    { id: 12, customer_id: 1, status: "cancelled" },
    { id: 13, customer_id: 3, status: "shipped" },
  ];
  const items = [
    { order_id: 10, quantity: 3, unit_price: 19.9 },
    { order_id: 11, quantity: 1, unit_price: 0.1 },
    { order_id: 11, quantity: 1, unit_price: 0.2 },
    { order_id: 12, quantity: 5, unit_price: 100 },
    { order_id: 13, quantity: 2, unit_price: 29.85 },
  ];
  assert.deepEqual(revenueByCity(customers, orders, items), [
    { city: "Acre", revenue: 59.7 },
    { city: "Haifa", revenue: 59.7 },
    { city: "unknown", revenue: 0.3 },
  ], "סכומים באגורות (59.7 ולא 59.699999999999996, ‏0.3 ולא 0.30000000000000004), מבוטלת לא נספרת, ותיקו לפי שם העיר");
  assert.deepEqual(revenueByCity([], [], []), []);
});
test("JOIN עם Map", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /new\s+Map\b/, "התרגיל מתרגל Map (פרק 7): אינדקס לפי id וקיבוץ לפי עיר");
  assert.doesNotMatch(src, /\.find\s*\(/, "בלי find בתוך לולאה — השתמש ב־Map לפי id");
});
