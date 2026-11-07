// P22-E07 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { cartTotal } from "./P22-E07.ts";

const mug = { price: 40, qty: 2 }; // 80
const jug = { price: 20, qty: 1 }; // 20

test("עגלה ריקה ← 0", () => {
  assert.equal(cartTotal([]), 0);
});

test("מחיר × כמות", () => {
  assert.equal(cartTotal([mug, jug]), 100);
});

test("קופון אחוזים וקופון קבוע", () => {
  assert.equal(cartTotal([mug, jug], { type: "percent", value: 10 }), 90);
  assert.equal(cartTotal([mug, jug], { type: "fixed", value: 15 }), 85);
});

test("minTotal: בדיוק בגבול — חל; מתחת — לא", () => {
  assert.equal(cartTotal([mug, jug], { type: "fixed", value: 10, minTotal: 100 }), 90);
  assert.equal(cartTotal([mug], { type: "fixed", value: 10, minTotal: 100 }), 80);
});

test("לא יורד מתחת ל־0", () => {
  assert.equal(cartTotal([jug], { type: "fixed", value: 50 }), 0);
});

test("עיגול לאגורות", () => {
  assert.equal(cartTotal([{ price: 0.1, qty: 3 }]), 0.3);
  assert.equal(cartTotal([{ price: 9.99, qty: 1 }], { type: "percent", value: 15 }), 8.49);
});
