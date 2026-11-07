import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { countOccurrences, unique, mostFrequent } = await load(import.meta.url, "P06-E13.js");

test("countOccurrences", () => { assert.equal(countOccurrences([1, 2, 1, 1], 1), 3); assert.equal(countOccurrences([], 1), 0); assert.equal(countOccurrences(["1"], 1), 0); });
test("unique שומר סדר", () => { assert.deepEqual(unique([3, 1, 3, 2, 1]), [3, 1, 2]); assert.deepEqual(unique([]), []); });
test("mostFrequent", () => { assert.equal(mostFrequent(["a", "b", "b", "a", "b"]), "b"); assert.equal(mostFrequent([1, 2, 2, 1]), 1); assert.equal(mostFrequent([]), undefined); });
