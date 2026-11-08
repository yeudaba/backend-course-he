import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { buildOrder } = await load(import.meta.url, "P27-E17.ts");

test("תלויות קודם; בין כמה מוכנים — לפי סדר אלפביתי", () => {
  const deps = {
    orders: ["users", "products"],
    payments: ["orders"],
    products: [],
    users: [],
    reviews: ["users", "products"],
  };
  assert.deepEqual(buildOrder(deps), ["products", "users", "orders", "payments", "reviews"]);
});
test("שם שמופיע רק כתלות — גם נכלל", () => {
  assert.deepEqual(buildOrder({ api: ["db", "redis"] }), ["db", "redis", "api"]);
  assert.deepEqual(buildOrder({}), []);
  assert.deepEqual(buildOrder({ b: ["a", "a"] }), ["a", "b"], "תלות כפולה — נספרת פעם אחת");
});
test("מעגל ← שגיאה שאומרת 'מעגל' ומי תקוע", () => {
  assert.throws(() => buildOrder({ a: ["b"], b: ["c"], c: ["a"], d: [] }), (err) => {
    assert.match(err.message, /מעגל/);
    assert.match(err.message, /a/);
    return true;
  });
  assert.throws(() => buildOrder({ self: ["self"] }), /מעגל/);
});
test("שרשרת של 3,000 — מהר", () => {
  const deps = {};
  for (let i = 1; i < 3000; i++) deps[`m${String(i).padStart(4, "0")}`] = [`m${String(i - 1).padStart(4, "0")}`];
  const order = fastEnough(() => buildOrder(deps), 1500, "buildOrder על שרשרת של 3,000");
  assert.equal(order[0], "m0000");
  assert.equal(order.at(-1), "m2999");
});
