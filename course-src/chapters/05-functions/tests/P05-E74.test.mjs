import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E74.js";
const get = () => exportsOf(import.meta.url, FILE, ["clamp","percent","progressBar"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("clamp", async () => {
  const { clamp } = await get();
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(42, 0, 10), 10);
});
test("percent", async () => {
  const { percent } = await get();
  assert.equal(percent(4, 10), 40);
  assert.equal(percent(1, 3), 33);
  assert.equal(percent(2, 3), 67);
  assert.equal(percent(12, 10), 100);
  assert.equal(percent(5, 0), 0, "total 0 ← 0 (ולא NaN או Infinity)");
});
test("progressBar", async () => {
  const { progressBar } = await get();
  assert.equal(progressBar(4, 10), "[####------] 40%");
  assert.equal(progressBar(1, 3), "[###-------] 33%");
  assert.equal(progressBar(12, 10), "[##########] 100%");
  assert.equal(progressBar(1, 2, 4), "[##--] 50%");
  assert.equal(progressBar(19, 20), "[#########-] 95%", "95% עדיין לא פס מלא — עגל למטה");
  assert.equal(progressBar(0, 0), "[----------] 0%");
});
