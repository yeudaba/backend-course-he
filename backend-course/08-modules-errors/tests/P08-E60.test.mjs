import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E60.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseFrame"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("פונקציה עם שם", async () => {
  const { parseFrame } = await get();
  assert.deepEqual(parseFrame("    at lineTotal (/p/lines.js:2:15)"), { fn: "lineTotal", file: "/p/lines.js", line: 2, col: 15 });
  assert.deepEqual(parseFrame("at Object.<anonymous> (/Users/y/dev/main.js:4:13)"), { fn: "Object.<anonymous>", file: "/Users/y/dev/main.js", line: 4, col: 13 });
});
test("פונקציה אנונימית — fn: null", async () => {
  const { parseFrame } = await get();
  assert.deepEqual(parseFrame("    at /p/orders.js:4:50"), { fn: null, file: "/p/orders.js", line: 4, col: 50 });
});
test("בלי מיקום מספרי", async () => {
  const { parseFrame } = await get();
  assert.deepEqual(parseFrame("    at Array.map (<anonymous>)"), { fn: "Array.map", file: "<anonymous>", line: null, col: null });
});
test("נתיב שיש בו נקודתיים", async () => {
  const { parseFrame } = await get();
  assert.deepEqual(parseFrame("    at Module._compile (node:internal/modules/cjs/loader:1554:14)"), { fn: "Module._compile", file: "node:internal/modules/cjs/loader", line: 1554, col: 14 });
  assert.deepEqual(parseFrame("    at C:\\dev\\a.js:7:3"), { fn: null, file: "C:\\dev\\a.js", line: 7, col: 3 });
});
