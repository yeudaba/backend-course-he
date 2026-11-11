import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E63.js";
const get = () => exportsOf(import.meta.url, FILE, ["countIf"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("זוגיים וכפולות של 7", async () => {
  const { countIf } = await get();
  assert.equal(countIf(1, 10, (n) => n % 2 === 0), 5);
  assert.equal(countIf(1, 100, (n) => n % 7 === 0), 14);
});
test("טווח ריק ותנאי שאף אחד לא מקיים", async () => {
  const { countIf } = await get();
  assert.equal(countIf(5, 4, () => true), 0);
  assert.equal(countIf(1, 10, (n) => n > 50), 0);
});
test("כולל הקצוות", async () => {
  const { countIf } = await get();
  assert.equal(countIf(3, 3, (n) => n === 3), 1);
  assert.equal(countIf(1, 10, () => true), 10);
});
