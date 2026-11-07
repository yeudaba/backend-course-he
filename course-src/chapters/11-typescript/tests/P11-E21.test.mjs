import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { priceOf, cartPrice } = await load(import.meta.url, "P11-E21.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E21.ts"); assert.ok(r.ok, r.output); });
const cat = [{ sku: "A", price: 10 }];
test("priceOf כנה", () => { assert.equal(priceOf(cat, "A"), 10); assert.equal(priceOf(cat, "Z"), null); });
test("cartPrice", () => { assert.equal(cartPrice(cat, ["A", "A"]), 20); assert.throws(() => cartPrice(cat, ["A", "Z"]), { message: "מוצר לא קיים: Z" }); });
