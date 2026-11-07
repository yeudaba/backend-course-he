import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createProduct, describeProduct } = await load(import.meta.url, "P07-E06.js");

test("createProduct", () => { assert.deepEqual(createProduct(" מקלדת ", 249, 4), { name: "מקלדת", price: 249, stock: 4, inStock: true }); });
test("createProduct עם ברירת מחדל", () => assert.deepEqual(createProduct("עכבר", 89), { name: "עכבר", price: 89, stock: 0, inStock: false }));
test("describeProduct", () => {
  assert.equal(describeProduct({ name: "מקלדת", price: 249, stock: 4, inStock: true }), "מקלדת — ₪249.00 (במלאי: 4)");
  assert.equal(describeProduct({ name: "עכבר", price: 89, stock: 0, inStock: false }), "עכבר — ₪89.00 (אזל)");
});
