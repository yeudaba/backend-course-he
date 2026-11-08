import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { project, applyEvent } = await load(import.meta.url, "P26.5-E13.ts");
const e = (orderId, seq, t) => ({ orderId, seq, type: `order.${t}` });
const view = (state) => Object.fromEntries([...state].map(([k, v]) => [k, v.status]));

test("זרם רגיל", () => {
  const r = project([e(1, 1, "placed"), e(2, 1, "placed"), e(1, 2, "paid"), e(1, 3, "shipped"), e(2, 2, "paid")]);
  assert.deepEqual(view(r.state), { 1: "shipped", 2: "paid" });
  assert.equal(r.applied, 5);
  assert.equal(r.ignored, 0);
});
test("כפילויות (at-least-once) ← מתעלמים", () => {
  const r = project([e(1, 1, "placed"), e(1, 2, "paid"), e(1, 2, "paid"), e(1, 1, "placed")]);
  assert.deepEqual(view(r.state), { 1: "paid" });
  assert.equal(r.ignored, 2);
});
test("אירוע ישן שמגיע אחרי חדש ← לא דורס", () => {
  const r = project([e(1, 1, "placed"), e(1, 3, "shipped"), e(1, 2, "paid")]);
  assert.deepEqual(view(r.state), { 1: "shipped" });
  assert.equal(r.state.get(1).seq, 3);
});
test("cancelled סופי", () => {
  const r = project([e(1, 1, "placed"), e(1, 2, "cancelled"), e(1, 3, "shipped")]);
  assert.deepEqual(view(r.state), { 1: "cancelled" });
});
test("applyEvent מחזיר אם שינה", () => {
  const s = new Map();
  assert.equal(applyEvent(s, e(9, 1, "placed")), true);
  assert.equal(applyEvent(s, e(9, 1, "placed")), false);
});
