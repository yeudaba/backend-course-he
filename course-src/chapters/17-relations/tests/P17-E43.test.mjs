import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P17-E43.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["checkForeignKeys"])).checkForeignKeys;
const msg = (col, v, table) => `Key (${col})=(${v}) is not present in table "${table}".`;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("נתונים תקינים — אין הודעות", async () => {
  const check = await get();
  assert.deepEqual(check({ customers: [{ id: 1 }], products: [{ id: 7 }], orders: [{ id: 3, customer_id: 1 }], order_items: [{ order_id: 3, product_id: 7 }] }), []);
  assert.deepEqual(check({ customers: [], products: [], orders: [], order_items: [] }), []);
});
test("הודעה לכל FK שבור, בסדר הנכון", async () => {
  const check = await get();
  const data = {
    customers: [{ id: 1 }, { id: 2 }],
    products: [{ id: 10 }, { id: 11 }],
    orders: [{ id: 100, customer_id: 1 }, { id: 101, customer_id: 99 }, { id: 102, customer_id: 2 }, { id: 103, customer_id: 50 }],
    order_items: [
      { order_id: 100, product_id: 10 },
      { order_id: 555, product_id: 11 },
      { order_id: 101, product_id: 12 },
      { order_id: 777, product_id: 13 },
    ],
  };
  assert.deepEqual(check(data), [
    msg("customer_id", 99, "customers"),
    msg("customer_id", 50, "customers"),
    msg("order_id", 555, "orders"),
    msg("product_id", 12, "products"),
    msg("order_id", 777, "orders"),
    msg("product_id", 13, "products"),
  ]);
});
test("עם Set, לא find/some בתוך לולאה", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /new\s+Set\b/, "בנה Set של המזהים של כל טבלת הורה");
  assert.doesNotMatch(src, /\.(find|some|includes|filter)\s*\(/, "בלי find/some/includes/filter — בדיקה עם has של Set");
});
