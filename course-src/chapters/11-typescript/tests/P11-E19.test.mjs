import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { restock, reserve, lowStock } = await load(import.meta.url, "P11-E19.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E19.ts"); assert.ok(r.ok, r.output); });
const make = () => new Map([["A", 5], ["B", 1]]);
test("restock", () => { const inv = make(); assert.equal(restock(inv, "A", 2).get("A"), 7); assert.equal(restock(inv, "C", 3).get("C"), 3); assert.equal(inv.get("A"), 5); });
test("reserve", () => {
  const inv = make();
  const r = reserve(inv, "A", 2);
  assert.equal(r.ok, true);
  assert.equal(r.value.get("A"), 3);
  assert.equal(inv.get("A"), 5);
  assert.deepEqual(reserve(inv, "Z", 1), { ok: false, error: "מוצר לא קיים" });
  assert.deepEqual(reserve(inv, "B", 2), { ok: false, error: "אין מספיק במלאי" });
});
test("lowStock", () => assert.deepEqual(lowStock(new Map([["C", 0], ["A", 5], ["B", 1]]), 3), ["B", "C"]));
