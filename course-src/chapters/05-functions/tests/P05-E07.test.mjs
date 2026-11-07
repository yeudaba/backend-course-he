import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { area, perimeter, describeRect } = await load(import.meta.url, "P05-E07.js");

test("area", () => { assert.equal(area(3, 4), 12); assert.equal(area(0, 9), 0); });
test("perimeter", () => { assert.equal(perimeter(3, 4), 14); assert.equal(perimeter(1, 1), 4); });
test("describeRect בפורמט המדויק", () => assert.equal(describeRect(3, 4), "מלבן 3×4: שטח 12, היקף 14"));
test("describeRect עם מספרים אחרים", () => assert.equal(describeRect(10, 2), "מלבן 10×2: שטח 20, היקף 24"));
