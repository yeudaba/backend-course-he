import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { calculate } = await load(import.meta.url, "P08-E25.js");

test("סדר פעולות", () => { assert.equal(calculate("2 + 3 * 4"), 14); assert.equal(calculate("10 / 4 - 1"), 1.5); assert.equal(calculate("2*3+4*5"), 26); });
test("מספר בודד ועשרוניים", () => { assert.equal(calculate("7"), 7); assert.equal(calculate("0.5 + 0.25"), 0.75); });
test("חיסור משמאל לימין", () => assert.equal(calculate("10 - 3 - 2"), 5));
test("שגיאות", () => {
  assert.throws(() => calculate("2 + x"), { message: "תו לא חוקי: x" });
  assert.throws(() => calculate("3 +"), { message: "ביטוי לא תקין" });
  assert.throws(() => calculate("+ 3"), { message: "ביטוי לא תקין" });
  assert.throws(() => calculate("2 + * 3"), { message: "ביטוי לא תקין" });
  assert.throws(() => calculate(""), { message: "ביטוי לא תקין" });
  assert.throws(() => calculate("4 / 0"), { message: "חילוק באפס" });
});
