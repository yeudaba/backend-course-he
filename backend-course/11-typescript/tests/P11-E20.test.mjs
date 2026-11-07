import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { orderTotal, parseShipping, lineTotal } = await load(import.meta.url, "P11-E20.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E20.ts"); assert.ok(r.ok, r.output); });
test("orderTotal", () => assert.equal(orderTotal([{ name: "עט", unitPrice: 5, quantity: 2 }], parseShipping("20")), 30));
test("parseShipping מחזיר מספר", () => assert.equal(parseShipping("15"), 15));
