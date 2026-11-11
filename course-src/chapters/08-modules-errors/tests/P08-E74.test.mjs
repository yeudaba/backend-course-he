import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E74.js";
const get = () => exportsOf(import.meta.url, FILE, ["formatProblem"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שורה בסגנון ESLint", async () => {
  const { formatProblem } = await get();
  assert.equal(formatProblem({ line: 6, column: 14, severity: "error", message: "Expected '===' and instead saw '=='", rule: "eqeqeq" }), "  6:14  error  Expected '===' and instead saw '=='  eqeqeq");
  assert.equal(formatProblem({ line: 4, column: 7, severity: "warning", message: "'vat' is never reassigned. Use 'const' instead", rule: "prefer-const" }), "  4:7  warning  'vat' is never reassigned. Use 'const' instead  prefer-const");
});
