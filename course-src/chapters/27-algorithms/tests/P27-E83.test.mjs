import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { typecheck, typeProbe } from "./_ts.mjs";
import { fastEnough } from "./_perf.mjs";

const { groupBy, countBy } = await load(import.meta.url, "P27-E83.ts");

test("סדר וקבוצות", () => {
  const orders = [{ id: 1, s: "paid" }, { id: 2, s: "cancelled" }, { id: 3, s: "paid" }];
  assert.deepEqual([...groupBy(orders, (o) => o.s)], [["paid", [orders[0], orders[2]]], ["cancelled", [orders[1]]]]);
  assert.deepEqual([...countBy([3, 1, 3, 2, 1, 3], (x) => x)], [[3, 3], [1, 2], [2, 1]]);
  assert.equal(groupBy([], (x) => x).size, 0);
  const m = groupBy([1, 2, 3, 4], (x) => x % 2 === 0);
  assert.deepEqual(m.get(true), [2, 4], "מפתח שאינו מחרוזת");
});
test("tsc --strict, וטיפוסים מדויקים", () => {
  const r = typecheck(import.meta.url, "P27-E83.ts");
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, "P27-E83.ts", `import { groupBy, countBy } from "FILE";
type Order = { id: number; status: "paid" | "cancelled" };
const orders: Order[] = [];
const g: Map<"paid" | "cancelled", Order[]> = groupBy(orders, (o) => o.status);
const c: Map<number, number> = countBy(orders, (o) => o.id);
// @ts-expect-error — המפתח הוא status, לא number
const bad: Map<number, Order[]> = groupBy(orders, (o) => o.status);
`);
  assert.ok(p.ok, p.message);
});
test("500,000 — מהר", () => {
  const items = Array.from({ length: 500_000 }, (_, i) => i);
  const g = fastEnough(() => groupBy(items, (x) => x % 1000), 200, "groupBy");
  assert.equal(g.size, 1000);
});
