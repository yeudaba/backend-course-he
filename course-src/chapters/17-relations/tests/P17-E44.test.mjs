import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P17-E44.ts";
async function setup(t) {
  const { addOrderItem } = await exportsOf(import.meta.url, FILE, ["addOrderItem"]);
  const db = await sandbox(t, import.meta.url, "store.sql");
  const sent = [];
  const client = { query: (text, values) => (sent.push({ text, values }), db.client.query(text, values)) };
  const items = async () => (await db.rows("SELECT COUNT(*) AS n FROM order_items"))[0].n;
  return { add: (...a) => addOrderItem(client, ...a), sent, db, items };
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הוספה במחיר מהמסד", async (t) => {
  const { add, db } = await setup(t);
  assert.deepEqual(await add(12, 9, 2), { ok: true, unitPrice: 24.9 });
  assert.deepEqual(await add(3, 5, 1), { ok: true, unitPrice: 649 });
  const rows = await db.rows("SELECT order_id, product_id, quantity, unit_price FROM order_items WHERE (order_id, product_id) IN ((12, 9), (3, 5)) ORDER BY order_id");
  assert.deepEqual(rows, [
    { order_id: 3, product_id: 5, quantity: 1, unit_price: 649 },
    { order_id: 12, product_id: 9, quantity: 2, unit_price: 24.9 },
  ]);
});
test("לא נמצא / כפול / לא תקין — בלי לשנות את המסד", async (t) => {
  const { add, items } = await setup(t);
  const before = await items();
  assert.deepEqual(await add(1, 99, 1), { ok: false, error: "not_found" }, "מוצר שלא קיים");
  assert.deepEqual(await add(1, 11, 1), { ok: false, error: "not_found" }, "מוצר לא פעיל (Digital Scale)");
  assert.deepEqual(await add(999, 1, 1), { ok: false, error: "not_found" }, "הזמנה שלא קיימת — FK (23503)");
  assert.deepEqual(await add(1, 1, 1), { ok: false, error: "duplicate" }, "מוצר שכבר בהזמנה — מפתח ראשי (23505)");
  assert.deepEqual(await add(1, 2, 0), { ok: false, error: "invalid" }, "כמות 0 — CHECK (23514)");
  assert.deepEqual(await add(1, 2, -3), { ok: false, error: "invalid" }, "כמות שלילית — CHECK");
  assert.equal(await items(), before, "שום שורה לא נוספה");
});
test("שגיאה אחרת — נזרקת הלאה", async (t) => {
  const { add } = await setup(t);
  await assert.rejects(add(1, 2, 2.5), (err) => err.code === "22P02", "כמות 2.5 בעמודת integer — זו לא אחת משלוש השגיאות, צריך לזרוק אותה");
});
test("פרמטרים, לא שרשור", async (t) => {
  const { add, sent } = await setup(t);
  await add(12, 9, 3);
  await add(1, 99, 1);
  assert.ok(sent.length >= 2);
  for (const s of sent) {
    assert.match(s.text, /\$1/, "כל ערך כפרמטר ($1, $2...)");
    assert.doesNotMatch(s.text, /\b(99|12)\b/, "המספרים לא בתוך טקסט השאילתה");
  }
});
