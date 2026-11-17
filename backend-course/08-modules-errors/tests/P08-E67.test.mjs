import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E67.js";
const get = () => exportsOf(import.meta.url, FILE, ["trace"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("הצלחה — שתי שורות ותוצאה", async () => {
  const { trace } = await get();
  const log = [];
  const tracedDouble = trace((n) => n * 2, "double", log);
  assert.equal(tracedDouble(4), 8);
  assert.deepEqual(log, ["→ double(4)", "← double = 8"]);
  tracedDouble(1);
  assert.equal(log.length, 4);
});
test("ערכים לא מספריים — JSON", async () => {
  const { trace } = await get();
  const log = [];
  trace((s) => ({ len: s.length }), "measure", log)("hi");
  assert.deepEqual(log, ['→ measure("hi")', '← measure = {"len":2}']);
});
test("שגיאה — נרשמת ונזרקת מחדש (אותה שגיאה)", async () => {
  const { trace } = await get();
  const log = [];
  const boom = new Error("בום");
  const traced = trace(() => {
    throw boom;
  }, "risky", log);
  assert.throws(() => traced(1), (err) => err === boom, "צריך לזרוק מחדש את אותה שגיאה (throw err)");
  assert.deepEqual(log, ["→ risky(1)", "✘ risky: בום"]);
});
test("trace מחזירה פונקציה ולא קוראת ל־fn מראש", async () => {
  const { trace } = await get();
  let calls = 0;
  const t = trace(() => calls++, "f", []);
  assert.equal(typeof t, "function");
  assert.equal(calls, 0);
});
