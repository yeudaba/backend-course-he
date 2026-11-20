import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E84.ts";
const get = () => exportsOf(import.meta.url, FILE, ["groupBy"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: K הוא שם שדה, והמפתחות בטיפוס של השדה", () => {
  const r = typeProbe(import.meta.url, FILE, `import { groupBy } from "FILE";
type Order = { id: number; status: "pending" | "paid"; total: number };
const orders: Order[] = [];
const byStatus: Map<"pending" | "paid", Order[]> = groupBy(orders, "status");
const byId: Map<number, Order[]> = groupBy(orders, "id");
// @ts-expect-error — "color" הוא לא שדה של Order
groupBy(orders, "color");
// @ts-expect-error — המפתחות של byStatus הם "pending" | "paid" בלבד
byStatus.get("shipped");
// @ts-expect-error — המפתחות של byId הם מספרים
byId.get("1");
export { byStatus, byId };
`);
  assert.ok(r.ok, r.message);
});
test("מקבץ לפי הסדר", async () => {
  const { groupBy } = await get();
  const orders = [
    { id: 1, status: "paid", total: 120 },
    { id: 2, status: "pending", total: 80 },
    { id: 3, status: "paid", total: 45 },
    { id: 4, status: "cancelled", total: 10 },
  ];
  const m = groupBy(orders, "status");
  assert.ok(m instanceof Map, "groupBy צריכה להחזיר Map");
  assert.deepEqual([...m.keys()], ["paid", "pending", "cancelled"], "מפתחות לפי ההופעה הראשונה");
  assert.deepEqual(m.get("paid").map((o) => o.id), [1, 3]);
  assert.equal(m.get("paid")[0], orders[0], "הפריטים עצמם, לא עותקים");
  assert.deepEqual(groupBy(orders, "total").size, 4);
  assert.equal(groupBy([], "x").size, 0);
});
test("מפתחות מספריים ו־0", async () => {
  const { groupBy } = await get();
  const items = [{ n: 0 }, { n: 1 }, { n: 0 }];
  const m = groupBy(items, "n");
  assert.deepEqual([...m.keys()], [0, 1]);
  assert.equal(m.get(0).length, 2, "מפתח 0 — לא לדלג עליו (בדיקה של if (k) תפספס אותו)");
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as");
});
