import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E66.js";
const get = () => exportsOf(import.meta.url, FILE, ["branchName"]);

test("feature ו־fix", async () => {
  const { branchName } = await get();
  assert.equal(branchName("Add monthly summary command"), "feature/add-monthly-summary-command");
  assert.equal(branchName("FIX: crash when file is empty!"), "fix/crash-when-file-is-empty");
  assert.equal(branchName("fix:typo"), "fix/typo");
});
test("תווים מיוחדים ורווחים", async () => {
  const { branchName } = await get();
  assert.equal(branchName("  Support   VAT (18%) & discounts "), "feature/support-vat-18-discounts");
  assert.equal(branchName("Add הוצאות command"), "feature/add-command", "אותיות שאינן a-z נעלמות");
});
test("עד 30 תווים, בלי מקף בסוף", async () => {
  const { branchName } = await get();
  assert.equal(branchName("Add a very long feature name that keeps going"), "feature/add-a-very-long-feature-name-t", "חותכים את ה־slug ל־30 תווים");
  assert.equal(branchName("Add abcdefghijkl abcdefghijkl x"), "feature/add-abcdefghijkl-abcdefghijkl", "התו ה־30 הוא - — מורידים אותו");
});
