import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E43.js";
const get = () => exportsOf(import.meta.url, FILE, ["applyCoupon"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("קופון קיים", async () => {
  const { applyCoupon } = await get();
  const coupons = { SALE10: 10, VIP: 25 };
  assert.equal(applyCoupon(200, "SALE10", coupons), 180);
  assert.equal(applyCoupon(99.9, "VIP", coupons), 74.93);
  assert.equal(applyCoupon(10, "VIP", { VIP: 33 }), 6.7);
});
test("ניקוי הקוד", async () => {
  const { applyCoupon } = await get();
  assert.equal(applyCoupon(200, " sale10 ", { SALE10: 10 }), 180);
  assert.equal(applyCoupon(100, "vip", { VIP: 50 }), 50);
});
test("קוד לא קיים או ריק", async () => {
  const { applyCoupon } = await get();
  assert.equal(applyCoupon(50, "NOPE", { VIP: 25 }), 50);
  assert.equal(applyCoupon(50, "", { VIP: 25 }), 50);
  assert.equal(applyCoupon(50, "  ", {}), 50);
});
test("תוצאה כמספר", async () => {
  const { applyCoupon } = await get();
  assert.equal(typeof applyCoupon(99.9, "VIP", { VIP: 25 }), "number");
});
