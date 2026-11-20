import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E85.ts";
const get = () => exportsOf(import.meta.url, FILE, ["sortProducts"]);

const products = () => [
  { id: 1, name: "מקלדת", price: 200, stock: 3 },
  { id: 2, name: "עכבר", price: 90, stock: 12 },
  { id: 3, name: "כבל", price: 25, stock: 40 },
  { id: 4, name: "אוזניות", price: 90, stock: 7 },
];
const ids = (list) => list.map((p) => p.id);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה ו־Product מיוצאים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { sortProducts, type Product } from "FILE";
const list: Product[] = [{ id: 1, name: "a", price: 1, stock: 1 }];
const sorted: Product[] = sortProducts(list, "price");
// @ts-expect-error — sort הוא מחרוזת
sortProducts(list, 5);
export { sorted };
`);
  assert.ok(r.ok, r.message);
});
test("עולה ויורד", async () => {
  const { sortProducts } = await get();
  assert.deepEqual(ids(sortProducts(products(), "price")), [3, 2, 4, 1], "price עולה (מיון יציב — 2 לפני 4)");
  assert.deepEqual(ids(sortProducts(products(), "-price")), [1, 2, 4, 3], "price יורד");
  assert.deepEqual(ids(sortProducts(products(), "stock")), [1, 4, 2, 3]);
  assert.deepEqual(ids(sortProducts(products(), "-stock")), [3, 2, 4, 1]);
  assert.deepEqual(ids(sortProducts(products(), "name")), [4, 3, 1, 2], "name — לפי סדר האותיות");
  assert.deepEqual(sortProducts([], "price"), []);
});
test("מערך חדש, המקור לא משתנה", async () => {
  const { sortProducts } = await get();
  const list = products();
  const r = sortProducts(list, "-price");
  assert.notEqual(r, list, "צריך להחזיר מערך חדש");
  assert.deepEqual(ids(list), [1, 2, 3, 4], "המערך המקורי השתנה");
});
test("שדה לא מותר ← Error", async () => {
  const { sortProducts } = await get();
  for (const sort of ["id", "-id", "", "-", "color", "Price", "--price", "price-"]) {
    assert.throws(() => sortProducts(products(), sort), (err) => err instanceof Error && err.message === "שדה מיון לא מוכר: " + sort, `sort="${sort}" צריך לזרוק Error("שדה מיון לא מוכר: ${sort}")`);
  }
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as — הבדיקה מול רשימת השדות צריכה להחזיר keyof Product בעצמה");
});
