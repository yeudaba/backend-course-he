import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("P18-E28: התוצאה (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const got = await db.fileRows("P18-E28.sql");
  const expected = await db.expectedRows("P18-E28.sql");
  assert.deepEqual(Object.keys(got?.[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן (month, place, customer_id, revenue)");
  assert.equal(got.length, 9, `${got.length} שורות — שלושה חודשים × שלושה לקוחות = 9`);
  assert.deepEqual(got, expected);
});
test("P18-E28: תיקו ← customer_id הקטן קודם", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  // שני לקוחות חדשים עם הכנסה ענקית ושווה בינואר
  await db.query("INSERT INTO big_orders (customer_id, status, total, created_at) VALUES (5002, 'paid', 99999, '2025-01-15 12:00+00'), (5001, 'shipped', 99999, '2025-01-16 12:00+00'), (5003, 'cancelled', 999999, '2025-01-16 12:00+00'), (5004, 'paid', 999999, '2025-04-01 12:00+00')");
  const jan = (await db.fileRows("P18-E28.sql")).filter((r) => r.place <= 3).slice(0, 3);
  assert.deepEqual(jan.map((r) => r.customer_id).slice(0, 2), [5001, 5002], "תיקו ב־revenue — ה־customer_id הקטן במקום הגבוה (ORDER BY revenue DESC, customer_id)");
  const all = await db.fileRows("P18-E28.sql");
  assert.ok(!all.some((r) => r.customer_id === 5003), "הזמנה מבוטלת לא נספרת");
  assert.ok(!all.some((r) => r.customer_id === 5004), "אפריל לא ברבעון הראשון");
});
