import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseNumbers, humanList } = await load(import.meta.url, "P06-E09.js");

test("parseNumbers", () => { assert.deepEqual(parseNumbers("10, 20,30"), [10, 20, 30]); assert.deepEqual(parseNumbers(" 7 "), [7]); assert.deepEqual(parseNumbers("1.5,2"), [1.5, 2]); });
test("parseNumbers של טקסט ריק", () => { assert.deepEqual(parseNumbers(""), []); assert.deepEqual(parseNumbers("   "), []); });
test("humanList", () => {
  assert.equal(humanList(["א", "ב", "ג"]), "א, ב ו־ג");
  assert.equal(humanList(["א", "ב"]), "א ו־ב");
  assert.equal(humanList(["א"]), "א");
  assert.equal(humanList([]), "");
});
