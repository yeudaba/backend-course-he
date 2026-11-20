// P22-E37 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { Cart } from "./P22-E37.ts";

test("עגלה ריקה", () => {
  const cart = new Cart();
  assert.equal(cart.count, 0);
  assert.equal(cart.totalAgorot(), 0);
});

test("כמה מוצרים — count סופר יחידות, total מחיר × כמות", () => {
  const cart = new Cart();
  cart.add("mug", 4990, 3);
  cart.add("pen", 590);
  assert.equal(cart.count, 4);
  assert.equal(cart.totalAgorot(), 3 * 4990 + 590);
});

test("אותו sku מצטבר, עד 10", () => {
  const cart = new Cart();
  cart.add("mug", 4990, 4);
  cart.add("mug", 4990, 6);
  assert.equal(cart.count, 10);
  assert.throws(() => cart.add("mug", 4990, 1), RangeError);
  assert.equal(cart.count, 10);
});

test("מתנה במחיר 0", () => {
  const cart = new Cart();
  cart.add("gift", 0, 2);
  assert.equal(cart.count, 2);
  assert.equal(cart.totalAgorot(), 0);
});

test("קלט לא תקין", () => {
  const cart = new Cart();
  for (const qty of [0, -1, 1.5]) assert.throws(() => cart.add("x", 100, qty), RangeError, `qty ${qty}`);
  for (const price of [-1, 9.9]) assert.throws(() => cart.add("x", price), RangeError, `price ${price}`);
  assert.equal(cart.count, 0);
});

test("remove", () => {
  const cart = new Cart();
  cart.add("mug", 4990, 2);
  assert.equal(cart.remove("mug"), true);
  assert.equal(cart.remove("mug"), false);
  assert.equal(cart.count, 0);
});
