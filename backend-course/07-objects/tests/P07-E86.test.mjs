import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { getField, raisePrice, label } = await load(import.meta.url, "P07-E86.js");

test("getField קורא את השדה ששמו ב־field", () => {
  const p = { name: "תה", price: 9, stock: 0 };
  assert.equal(getField(p, "price"), 9);
  assert.equal(getField(p, "name"), "תה");
  assert.equal(getField(p, "stock"), 0, "שדה עם הערך 0 קיים — צריך להחזיר 0, לא null");
  assert.equal(getField(p, "color"), null);
});
test("raisePrice משנה את האובייקט ומחזירה אותו", () => {
  const p = { name: "קפה", price: 12, stock: 40 };
  const r = raisePrice(p, 3);
  assert.equal(p.price, 15, "המחיר באובייקט לא השתנה — חסרה הצבה");
  assert.equal(r, p, "צריך להחזיר את אותו אובייקט");
  raisePrice(p, 0.5);
  assert.equal(p.price, 15.5);
  assert.equal(p.stock, 40, "רק price משתנה");
});
test("label", () => {
  assert.equal(label({ name: "קפה", price: 12 }), "קפה — 12 ₪");
  assert.equal(label({ name: "מאפה", price: 8.5, stock: 3 }), "מאפה — 8.5 ₪");
});
