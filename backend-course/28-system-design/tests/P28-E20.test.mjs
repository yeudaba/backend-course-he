import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { encode, decode } = await load(import.meta.url, "P28-E20.ts");

test("encode", () => {
  assert.equal(encode(0), "0");
  assert.equal(encode(61), "Z");
  assert.equal(encode(62), "10");
  assert.equal(encode(125), "21");
  assert.equal(encode(3843), "ZZ");
  assert.equal(encode(1_000_000), "4c92");
});
test("decode הפוך ל־encode", () => {
  for (const n of [0, 1, 61, 62, 999, 123_456_789, Number.MAX_SAFE_INTEGER]) assert.equal(decode(encode(n)), n);
  assert.equal(decode("4c92"), 1_000_000);
});
test("קלט לא תקין ← שגיאה", () => {
  assert.throws(() => encode(-1));
  assert.throws(() => encode(1.5));
  assert.throws(() => decode(""));
  assert.throws(() => decode("ab-c"));
});
