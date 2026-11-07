import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { averageScore } = await load(import.meta.url, "P08-E11.js");

test("ממוצע נכון", () => { assert.equal(averageScore([80, 90, 100]), 90); assert.equal(averageScore([50]), 50); assert.equal(averageScore([10, 20]), 15); });
test("ריק", () => assert.equal(averageScore([]), 0));
