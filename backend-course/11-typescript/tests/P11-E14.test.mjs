import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";
import { typeProbe } from "./_ts.mjs";

const { groupBy, indexBy, sumBy } = await load(import.meta.url, "P11-E14.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E14.ts"); assert.ok(r.ok, r.output); });
const orders = [{ id: 1, status: "paid", total: 10 }, { id: 2, status: "new", total: 5 }, { id: 3, status: "paid", total: 7 }];
test("הטיפוסים גנריים ולא any", () => {
  const r = typeProbe(import.meta.url, "P11-E14.ts", `import { groupBy, indexBy, sumBy } from "FILE";
type Order = { id: number; status: string; total: number };
const orders: Order[] = [{ id: 1, status: "paid", total: 10 }];
const g = groupBy(orders, (o) => o.status);
const paid: Order[] | undefined = g["paid"];
// @ts-expect-error — הפריטים בקבוצה הם מהטיפוס של ההזמנות (Order), לא any
const wrong: number = g["paid"]![0];
// @ts-expect-error — keyFn מקבלת Order, ואין לו שדה name
groupBy(orders, (o) => o.name);
const m = indexBy(orders, (o) => o.id);
const one: Order | undefined = m.get(1);
// @ts-expect-error — המפתחות של ה־Map הם מהטיפוס ש־keyFn מחזירה (number)
m.get("1");
const s: number = sumBy(orders, (o) => o.total);
// @ts-expect-error — fn של sumBy חייבת להחזיר מספר
sumBy(orders, (o) => o.status);
`);
  assert.ok(r.ok, r.message);
});
test("groupBy", () => assert.deepEqual(groupBy(orders, (o) => o.status), { paid: [orders[0], orders[2]], new: [orders[1]] }));
test("indexBy", () => { const m = indexBy(orders, (o) => o.id); assert.ok(m instanceof Map); assert.equal(m.get(2), orders[1]); });
test("sumBy", () => { assert.equal(sumBy(orders, (o) => o.total), 22); assert.equal(sumBy([], () => 1), 0); });
