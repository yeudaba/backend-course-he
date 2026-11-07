import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { parseProduct } = await load(import.meta.url, "P15-E11.ts");

test("תקין עם ברירות מחדל", () => assert.deepEqual(parseProduct({ name: " מסך ", price: 899 }), { ok: true, data: { name: "מסך", price: 899, tags: [], inStock: true } }));
test("שדות מלאים, ושדה זר נמחק", () => assert.deepEqual(parseProduct({ name: "כבל", price: 0.5, tags: ["a"], inStock: false, isAdmin: true }), { ok: true, data: { name: "כבל", price: 0.5, tags: ["a"], inStock: false } }));
test("שגיאות עם path", () => {
  const paths = (input) => { const r = parseProduct(input); assert.equal(r.ok, false); return r.errors.map((e) => e.path); };
  assert.deepEqual(paths({ name: " x ", price: 5 }), ["name"]);
  assert.deepEqual(paths({ name: "x".repeat(81), price: 5 }), ["name"]);
  assert.deepEqual(paths({ name: "ab", price: 0 }), ["price"]);
  assert.deepEqual(paths({ name: "ab", price: 100_001 }), ["price"]);
  assert.deepEqual(paths({ name: "ab", price: 5, tags: ["a", 2] }), ["tags.1"]);
  assert.deepEqual(paths({ name: "ab", price: 5, tags: ["1", "2", "3", "4", "5", "6"] }), ["tags"]);
  assert.deepEqual(paths({ price: "5" }).sort(), ["name", "price"]);
  for (const e of parseProduct({}).errors) assert.equal(typeof e.message, "string");
});
