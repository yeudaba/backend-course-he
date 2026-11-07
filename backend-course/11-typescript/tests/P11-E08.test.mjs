import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { createProduct, withDiscount, isAvailable } = await load(import.meta.url, "P11-E08.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E08.ts"); assert.ok(r.ok, r.output); });
test("createProduct", () => assert.deepEqual(createProduct(1, "עט", 10), { id: 1, name: "עט", price: 10, tags: [] }));
test("withDiscount לא משנה מקור", () => { const p = createProduct(1, "עט", 10); assert.equal(withDiscount(p, 15).price, 8.5); assert.equal(p.price, 10); });
test("isAvailable", () => { assert.equal(isAvailable({ id: 1, name: "a", price: 1, tags: [] }), false); assert.equal(isAvailable({ id: 1, name: "a", price: 1, tags: [], stock: 2 }), true); });
