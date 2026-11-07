import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { addVat, numbered, toNumbers } = await load(import.meta.url, "P06-E10.js");

test("addVat", () => { assert.deepEqual(addVat([100, 49.9], 0.18), [118, 58.88]); assert.deepEqual(addVat([], 0.18), []); });
test("numbered", () => assert.deepEqual(numbered(["תה", "קפה"]), ["1. תה", "2. קפה"]));
test("toNumbers", () => assert.deepEqual(toNumbers(["1", "2.5", "-3"]), [1, 2.5, -3]));
test("addVat לא משנה את המקור", () => { const p = [10]; addVat(p, 0.5); assert.deepEqual(p, [10]); });
