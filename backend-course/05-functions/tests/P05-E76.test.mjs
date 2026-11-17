import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E76.js";
const get = () => exportsOf(import.meta.url, FILE, ["maskCard"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("רווחים ומקפים", async () => {
  const { maskCard } = await get();
  assert.equal(maskCard("4580 1234 1234 5678"), "**** **** **** 5678");
  assert.equal(maskCard("4580-1234-1234-9999"), "**** **** **** 9999");
  assert.equal(maskCard("4580123412340001"), "**** **** **** 0001");
});
test("לא 16 ספרות ← null", async () => {
  const { maskCard } = await get();
  assert.equal(maskCard("4580 1234"), null);
  assert.equal(maskCard("4580 1234 1234 5678 9"), null);
  assert.equal(maskCard(""), null);
});
test("מפורק לפונקציות", () => {
  const n = (src().match(/\bfunction\s+\w+|\bconst\s+\w+\s*=\s*\(/g) ?? []).length;
  assert.ok(n >= 3, `מצאנו ${n} פונקציות — פרק את הבעיה לפחות לשלוש`);
});
