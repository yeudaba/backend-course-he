import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E65.js";
const get = () => exportsOf(import.meta.url, FILE, ["makeFormatter"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מחזירה פונקציה", async () => {
  const { makeFormatter } = await get();
  assert.equal(typeof makeFormatter(), "function", "makeFormatter() צריכה להחזיר פונקציה");
});
test("ברירות מחדל", async () => {
  const { makeFormatter } = await get();
  const f = makeFormatter();
  assert.equal(f(19.9), "₪19.90");
  assert.equal(f(0), "₪0.00");
});
test("מטבע וספרות אחרים", async () => {
  const { makeFormatter } = await get();
  assert.equal(makeFormatter("$")(5), "$5.00");
  assert.equal(makeFormatter("€", 0)(19.9), "€20");
  assert.equal(makeFormatter("₪", 1)(3.14159), "₪3.1");
});
test("כל פורמט זוכר את שלו", async () => {
  const { makeFormatter } = await get();
  const a = makeFormatter("$");
  const b = makeFormatter("€", 0);
  assert.equal(a(1), "$1.00");
  assert.equal(b(1), "€1");
  assert.equal(a(2), "$2.00", "אחרי שיצרת פורמט שני, הראשון השתנה — אל תשמור את המטבע במשתנה מחוץ לפונקציה");
});
