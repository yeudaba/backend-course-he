import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { cartTotal, addItem, removeSku } = await load(import.meta.url, "P11-E13.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E13.ts"); assert.ok(r.ok, r.output); });
const item = (sku, qty = 1, price = 2.5) => ({ sku, name: sku, price, qty });
test("cartTotal", () => { assert.equal(cartTotal([item("A", 3), item("B", 1, 0.1)]), 7.6); assert.equal(cartTotal([]), 0); });
test("addItem מאחד sku קיים", () => { const c = [item("A", 2)]; const r = addItem(c, item("A", 1)); assert.deepEqual(r, [item("A", 3)]); assert.equal(c[0].qty, 2); });
test("addItem מוסיף חדש", () => assert.equal(addItem([item("A")], item("B")).length, 2));
test("removeSku", () => assert.deepEqual(removeSku([item("A"), item("B")], "A"), [item("B")]));
