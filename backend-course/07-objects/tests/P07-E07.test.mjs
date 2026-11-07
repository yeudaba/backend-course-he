import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { priceOf, withProduct } = await load(import.meta.url, "P07-E07.js");

const catalog = { "KB-101": 199, "MS-201": 89 };
test("priceOf", () => { assert.equal(priceOf(catalog, "KB-101"), 199); assert.equal(priceOf(catalog, " ms-201 "), 89); assert.equal(priceOf(catalog, "X"), null); });
test("withProduct מוסיף ומעדכן", () => {
  assert.deepEqual(withProduct(catalog, "kb-102", 249), { "KB-101": 199, "MS-201": 89, "KB-102": 249 });
  assert.deepEqual(withProduct(catalog, "KB-101", 150), { "KB-101": 150, "MS-201": 89 });
});
test("withProduct לא משנה את המקור", () => { withProduct(catalog, "Z", 1); assert.deepEqual(catalog, { "KB-101": 199, "MS-201": 89 }); });
