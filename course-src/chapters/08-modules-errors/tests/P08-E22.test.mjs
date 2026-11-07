import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { longestStreak } = await load(import.meta.url, "P08-E22.js");

test("רצף בסוף", () => assert.equal(longestStreak([true, false, true, true, true]), 3));
test("רצף באמצע", () => assert.equal(longestStreak([true, true, false, true]), 2));
test("הכול true / הכול false / ריק", () => { assert.equal(longestStreak([true, true]), 2); assert.equal(longestStreak([false]), 0); assert.equal(longestStreak([]), 0); });
