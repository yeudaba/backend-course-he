import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { topN, median } = await load(import.meta.url, "P06-E18.js");

test("topN", () => { assert.deepEqual(topN([5, 100, 20, 7], 2), [100, 20]); assert.deepEqual(topN([1], 3), [1]); });
test("topN לא משנה את הקלט", () => { const a = [5, 100, 20]; topN(a, 1); assert.deepEqual(a, [5, 100, 20]); });
test("median", () => { assert.equal(median([5, 1, 9]), 5); assert.equal(median([4, 1, 3, 10]), 3.5); assert.equal(median([10, 2]), 6); assert.equal(median([]), null); });
test("median לא משנה את הקלט", () => { const a = [3, 1, 2]; median(a); assert.deepEqual(a, [3, 1, 2]); });
