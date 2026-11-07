import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { toNumber } = await load(import.meta.url, "P11-E12.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E12.ts"); assert.ok(r.ok, r.output); });
test("מספרים", () => { assert.equal(toNumber(5), 5); assert.equal(toNumber(NaN), null); assert.equal(toNumber(Infinity), null); });
test("מחרוזות", () => { assert.equal(toNumber(" 12.5 "), 12.5); assert.equal(toNumber(""), null); assert.equal(toNumber("  "), null); assert.equal(toNumber("abc"), null); });
test("סוגים אחרים", () => { for (const v of [true, null, undefined, {}, [1]]) assert.equal(toNumber(v), null); });
