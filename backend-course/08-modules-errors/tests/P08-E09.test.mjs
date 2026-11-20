import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { safeParse, parseOrThrow } = await load(import.meta.url, "P08-E09.js");

test("safeParse", () => { assert.deepEqual(safeParse('{"a":1}'), { a: 1 }); assert.deepEqual(safeParse("{oops", {}), {}); assert.equal(safeParse("{oops"), null); });
test("safeParse — JSON תקין שהוא falsy (0, false, \"\", null) מוחזר כמו שהוא", () => {
  assert.equal(safeParse("0", "x"), 0);
  assert.equal(safeParse("false", "x"), false);
  assert.equal(safeParse('""', "x"), "");
  assert.equal(safeParse("null", "x"), null);
});
test("parseOrThrow", () => { assert.deepEqual(parseOrThrow("[1,2]"), [1, 2]); assert.throws(() => parseOrThrow("{"), { message: "JSON לא תקין" }); });
