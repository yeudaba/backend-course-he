import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { formatId, toArray, lengthOf } = await load(import.meta.url, "P11-E11.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E11.ts"); assert.ok(r.ok, r.output); });
test("formatId", () => { assert.equal(formatId(42), "#0042"); assert.equal(formatId(12345), "#12345"); assert.equal(formatId("ab-1"), "AB-1"); });
test("toArray", () => { assert.deepEqual(toArray(5), [5]); assert.deepEqual(toArray([1, 2]), [1, 2]); });
test("lengthOf", () => { assert.equal(lengthOf(null), 0); assert.equal(lengthOf("abc"), 3); assert.equal(lengthOf([1]), 1); });
