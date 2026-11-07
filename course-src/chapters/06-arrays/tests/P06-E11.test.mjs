import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { onlyPositive, longWords, withoutValue } = await load(import.meta.url, "P06-E11.js");

test("onlyPositive (0 לא חיובי)", () => assert.deepEqual(onlyPositive([3, -1, 0, 7]), [3, 7]));
test("longWords", () => { assert.deepEqual(longWords(["a", "node", "js"], 2), ["node", "js"]); assert.deepEqual(longWords(["a"], 5), []); });
test("withoutValue", () => { assert.deepEqual(withoutValue([1, 2, 1, 3], 1), [2, 3]); assert.deepEqual(withoutValue(["a"], "b"), ["a"]); });
