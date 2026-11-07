import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { square, isPositive, greet, maxOfTwo } = await load(import.meta.url, "P05-E11.js");

test("square", () => { assert.equal(square(7), 49); assert.equal(square(-3), 9); });
test("isPositive — 0 אינו חיובי", () => { assert.equal(isPositive(5), true); assert.equal(isPositive(0), false); assert.equal(isPositive(-2), false); });
test("greet", () => assert.equal(greet("דנה"), "שלום, דנה!"));
test("maxOfTwo", () => { assert.equal(maxOfTwo(3, 8), 8); assert.equal(maxOfTwo(8, 3), 8); assert.equal(maxOfTwo(-1, -5), -1); });
