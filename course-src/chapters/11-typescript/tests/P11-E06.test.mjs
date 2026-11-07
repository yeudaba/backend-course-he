import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { formatPrice, isAdult, average } = await load(import.meta.url, "P11-E06.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E06.ts"); assert.ok(r.ok, r.output); });
test("formatPrice", () => { assert.equal(formatPrice(12.5), "₪12.50"); assert.equal(formatPrice(3, "$"), "$3.00"); });
test("isAdult", () => { assert.equal(isAdult(18), true); assert.equal(isAdult(17), false); });
test("average", () => { assert.equal(average([1, 2, 3]), 2); assert.equal(average([]), 0); });
