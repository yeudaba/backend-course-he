import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { stats } = await load(import.meta.url, "P06-E17.js");

test("דוגמה", () => assert.deepEqual(stats([4, -2, 9, 1]), [-2, 9, 3]));
test("כולם חיוביים / כולם שליליים", () => { assert.deepEqual(stats([5, 7]), [5, 7, 6]); assert.deepEqual(stats([-5, -7]), [-7, -5, -6]); });
test("ממוצע מעוגל", () => assert.deepEqual(stats([1, 2, 2]), [1, 2, 1.67]));
test("ריק → null", () => assert.equal(stats([]), null));
