import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E41.js";
const get = () => exportsOf(import.meta.url, FILE, ["splitOrders"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const validate = () => exportsOf(import.meta.url, "P08-E41-validate.js", ["orderErrors"]);
test("orderErrors", async () => {
  const { orderErrors } = await validate();
  assert.deepEqual(orderErrors({ id: 1, email: "a@b.c", items: [{ qty: 2 }] }), []);
  assert.deepEqual(orderErrors({ id: 2, email: "bad", items: [] }), ["אימייל לא תקין", "הזמנה ריקה"]);
  assert.deepEqual(orderErrors({ id: 3, email: "a@b.c", items: [{ qty: 1 }, { qty: 0 }] }), ["כמות לא תקינה"]);
  assert.deepEqual(orderErrors({ id: 4, email: "x", items: [{ qty: 1.5 }] }), ["אימייל לא תקין", "כמות לא תקינה"]);
  assert.deepEqual(orderErrors({ id: 5, email: "a@b", items: [{ qty: "2" }] }), ["כמות לא תקינה"]);
});
test("splitOrders", async () => {
  const { splitOrders } = await get();
  assert.deepEqual(splitOrders([
    { id: 1, email: "a@b.c", items: [{ qty: 2 }] },
    { id: 2, email: "bad", items: [] },
    { id: 3, email: "c@d.e", items: [{ qty: 1 }] },
  ]), { valid: [1, 3], invalid: [{ id: 2, errors: ["אימייל לא תקין", "הזמנה ריקה"] }] });
  assert.deepEqual(splitOrders([]), { valid: [], invalid: [] });
});
test("splitOrders מייבאת את orderErrors", () => {
  assert.match(src(), /require\(\s*["']\.\/P08-E41-validate(\.js)?["']\s*\)/, 'חסר require("./P08-E41-validate")');
  assert.doesNotMatch(src(), /function\s+orderErrors\b/, "אל תגדיר את orderErrors שוב — ייבא אותה");
});
