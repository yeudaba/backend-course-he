import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { applyToPrices, countWhere, compose } = await load(import.meta.url, "P11-E10.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E10.ts"); assert.ok(r.ok, r.output); });
test("applyToPrices", () => assert.deepEqual(applyToPrices([10.4, 20.6], Math.round), [10, 21]));
test("countWhere", () => assert.equal(countWhere(["a", "bb", "ccc"], (s) => s.length > 1), 2));
test("compose: g ואז f", () => assert.equal(compose((x) => x + 1, (x) => x * 10)(2), 21));
