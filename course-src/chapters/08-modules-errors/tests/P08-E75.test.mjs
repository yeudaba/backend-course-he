import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E75.js";
const get = () => exportsOf(import.meta.url, FILE, ["summaryLine"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("כמה בעיות", async () => {
  const { summaryLine } = await get();
  assert.equal(summaryLine([{ severity: "error" }, { severity: "warning" }, { severity: "warning" }]), "✖ 3 problems (1 error, 2 warnings)");
  assert.equal(summaryLine([{ severity: "error" }, { severity: "error" }, { severity: "warning" }, { severity: "warning" }, { severity: "warning" }]), "✖ 5 problems (2 errors, 3 warnings)");
});
test("יחיד ואפס", async () => {
  const { summaryLine } = await get();
  assert.equal(summaryLine([{ severity: "error" }]), "✖ 1 problem (1 error, 0 warnings)");
  assert.equal(summaryLine([{ severity: "warning" }]), "✖ 1 problem (0 errors, 1 warning)");
});
test("בלי בעיות", async () => {
  const { summaryLine } = await get();
  assert.equal(summaryLine([]), "");
});
