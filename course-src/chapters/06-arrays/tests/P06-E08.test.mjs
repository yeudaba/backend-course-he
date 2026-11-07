import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sum, average } = await load(import.meta.url, "P06-E08.js");

test("sum", () => { assert.equal(sum([1, 2, 3]), 6); assert.equal(sum([]), 0); assert.equal(sum([-5, 5]), 0); });
test("average", () => { assert.equal(average([90, 80, 70]), 80); assert.equal(average([1, 2]), 1.5); });
test("average של מערך ריק הוא 0", () => assert.equal(average([]), 0));
