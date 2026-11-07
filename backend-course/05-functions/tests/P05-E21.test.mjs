import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sumPrices } = await load(import.meta.url, "P05-E21.js");

test("קריאה ראשונה", () => assert.equal(sumPrices("10,20,30"), 60));
test("קריאה שנייה נותנת אותה תוצאה (פונקציה טהורה)", () => { sumPrices("1,2"); assert.equal(sumPrices("10,20,30"), 60); });
test("מספר בודד", () => assert.equal(sumPrices("7"), 7));
