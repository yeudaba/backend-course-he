import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { groupBy, indexBy, sumBy } = await load(import.meta.url, "P11-E14.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E14.ts"); assert.ok(r.ok, r.output); });
const orders = [{ id: 1, status: "paid", total: 10 }, { id: 2, status: "new", total: 5 }, { id: 3, status: "paid", total: 7 }];
test("groupBy", () => assert.deepEqual(groupBy(orders, (o) => o.status), { paid: [orders[0], orders[2]], new: [orders[1]] }));
test("indexBy", () => { const m = indexBy(orders, (o) => o.id); assert.ok(m instanceof Map); assert.equal(m.get(2), orders[1]); });
test("sumBy", () => { assert.equal(sumBy(orders, (o) => o.total), 22); assert.equal(sumBy([], () => 1), 0); });
