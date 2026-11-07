import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { shippingCost } = await load(import.meta.url, "P05-E14.js");

test("גבולות התעריפים", () => {
  assert.equal(shippingCost(1), 25);
  assert.equal(shippingCost(1.01), 40);
  assert.equal(shippingCost(5), 40);
  assert.equal(shippingCost(20), 70);
});
test("מעל 20 ק״ג", () => { assert.equal(shippingCost(20.1), 75); assert.equal(shippingCost(23.4), 90); });
test("משקל לא חוקי → null", () => {
  assert.equal(shippingCost(0), null);
  assert.equal(shippingCost(-3), null);
  assert.equal(shippingCost(NaN), null);
  assert.equal(shippingCost("5"), null);
});
