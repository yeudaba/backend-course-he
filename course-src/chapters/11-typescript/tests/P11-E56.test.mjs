import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E56.ts";
const get = () => exportsOf(import.meta.url, FILE, ["indexById", "missingIds", "orderTotal"]);
const products = [{ id: 1, name: "עט", price: 5 }, { id: 2, name: "מחברת", price: 12 }, { id: 30, name: "תיק", price: 99.9 }];

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { indexById, missingIds, orderTotal } from "FILE";
import type { Product } from "FILE";
const idx: Map<number, Product> = indexById([{ id: 1, name: "a", price: 1 }]);
const m: number[] = missingIds([1], idx);
const t: number = orderTotal([{ id: 1, qty: 2 }], idx);
// @ts-expect-error — שורת הזמנה צריכה qty
orderTotal([{ id: 1 }], idx);
// @ts-expect-error — המפתחות הם מספרים
const bad: Map<string, Product> = indexById([]);
export { m, t, bad };
`);
  assert.ok(r.ok, r.message);
});
test("indexById", async () => {
  const { indexById } = await get();
  const idx = indexById(products);
  assert.ok(idx instanceof Map);
  assert.deepEqual([...idx.keys()], [1, 2, 30]);
  assert.equal(idx.get(30), products[2]);
  assert.throws(() => indexById([...products, { id: 2, name: "x", price: 1 }]), { message: "מזהה כפול: 2" });
});
test("missingIds — לפי הסדר, בלי כפילויות", async () => {
  const { indexById, missingIds } = await get();
  const idx = indexById(products);
  assert.deepEqual(missingIds([1, 7, 2, 7, 9, 30], idx), [7, 9]);
  assert.deepEqual(missingIds([], idx), []);
  assert.deepEqual(missingIds([1, 2], idx), []);
});
test("orderTotal", async () => {
  const { indexById, orderTotal } = await get();
  const idx = indexById(products);
  assert.equal(orderTotal([{ id: 1, qty: 3 }, { id: 2, qty: 1 }], idx), 27);
  assert.equal(orderTotal([], idx), 0);
  assert.throws(() => orderTotal([{ id: 1, qty: 1 }, { id: 4, qty: 2 }], idx), { message: "אין מוצר 4" });
});
