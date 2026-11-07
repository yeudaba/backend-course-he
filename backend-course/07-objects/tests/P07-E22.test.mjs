import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { getField, toLines, sameContent } = await load(import.meta.url, "P07-E22.js");

test("getField", () => { assert.equal(getField({ city: "חיפה" }, "city"), "חיפה"); assert.equal(getField({ a: 1 }, "b"), undefined); });
test("toLines", () => assert.deepEqual(toLines({ a: 1, b: 2 }), ["a: 1", "b: 2"]));
test("sameContent", () => { assert.equal(sameContent({ x: [1] }, { x: [1] }), true); assert.equal(sameContent({ x: 1 }, { x: 2 }), false); });
