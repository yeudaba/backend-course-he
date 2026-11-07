import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { passedCount, allPassed, hasPerfect, firstFailIndex } = await load(import.meta.url, "P06-E15.js");

const scores = [80, 54, 100, 70];
test("passedCount", () => { assert.equal(passedCount(scores), 3); assert.equal(passedCount(scores, 75), 2); });
test("allPassed", () => { assert.equal(allPassed(scores), false); assert.equal(allPassed([55, 90]), true); });
test("allPassed על כיתה ריקה → false", () => assert.equal(allPassed([]), false));
test("hasPerfect", () => { assert.equal(hasPerfect(scores), true); assert.equal(hasPerfect([99]), false); });
test("firstFailIndex", () => { assert.equal(firstFailIndex(scores), 1); assert.equal(firstFailIndex([90]), -1); });
