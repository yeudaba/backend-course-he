import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { discountPrice, addShipping, finalPrice } = await load(import.meta.url, "P05-E20.js");

test("discountPrice מחזירה (לא מדפיסה)", () => assert.equal(discountPrice(200, 10), 180));
test("addShipping מחזירה", () => assert.equal(addShipping(180), 205));
test("finalPrice מחזירה", () => assert.equal(finalPrice(200, 10), 205));
