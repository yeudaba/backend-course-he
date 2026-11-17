import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E68.js";
const get = () => exportsOf(import.meta.url, FILE, ["gradeLabel","gradeLabels"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("gradeLabel — גבולות", async () => {
  const { gradeLabel } = await get();
  assert.equal(gradeLabel(90), "מצוין");
  assert.equal(gradeLabel(100), "מצוין");
  assert.equal(gradeLabel(89), "עובר");
  assert.equal(gradeLabel(55), "עובר");
  assert.equal(gradeLabel(54), "נכשל");
  assert.equal(gradeLabel(0), "נכשל");
});
test("gradeLabels", async () => {
  const { gradeLabels } = await get();
  assert.deepEqual(gradeLabels([95, 40, 70]), ["מצוין", "נכשל", "עובר"]);
  assert.deepEqual(gradeLabels([]), []);
});
test("gradeLabels עם map ו־gradeLabel", () => {
  assert.match(src(), /\.map\s*\(/, "השתמש ב־map");
  assert.match(src(), /function\s+gradeLabels[\s\S]*gradeLabel\b|gradeLabels\s*=[\s\S]*gradeLabel\b/, "gradeLabels צריכה להשתמש ב־gradeLabel");
});
