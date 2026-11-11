import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E58.js";
const get = () => exportsOf(import.meta.url, FILE, ["topFrame"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

function thrower() {
  throw new Error("בום");
}
test("שורת ה־at הראשונה, אחרי trim", async () => {
  const { topFrame } = await get();
  const err = { stack: "TypeError: x\n    at lineTotal (/p/lines.js:2:15)\n    at /p/orders.js:4:50" };
  assert.equal(topFrame(err), "at lineTotal (/p/lines.js:2:15)");
});
test("שגיאה אמיתית — הפונקציה שזרקה", async () => {
  const { topFrame } = await get();
  try {
    thrower();
  } catch (err) {
    assert.match(topFrame(err), /^at thrower \(/);
  }
});
test("הודעה עם כמה שורות", async () => {
  const { topFrame } = await get();
  const err = { stack: "Error: שורה 1\nשורה 2\n    at f (/a.js:1:1)" };
  assert.equal(topFrame(err), "at f (/a.js:1:1)");
});
test("אין at ← null", async () => {
  const { topFrame } = await get();
  assert.equal(topFrame({ stack: "Error: x" }), null);
});
