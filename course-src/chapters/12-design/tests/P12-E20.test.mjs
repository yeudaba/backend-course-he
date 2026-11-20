import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { PriceFormatter } = await load(import.meta.url, "P12-E20.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E20.ts"); assert.ok(r.ok, r.output); });
test("שני הסגנונות", () => { const f = new PriceFormatter("₪"); assert.deepEqual([10, 2.5].map(f.format), ["₪10.00", "₪2.50"]); assert.equal(f.format(1), "₪1.00"); });
test("המטבע מגיע מה־constructor", () => { const f = new PriceFormatter("$"); assert.deepEqual([3].map(f.format), ["$3.00"]); assert.equal(f.format(0.5), "$0.50"); });
