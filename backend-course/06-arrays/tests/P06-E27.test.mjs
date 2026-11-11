import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P06-E27.js", ["collatz"]);

test("collatz(6)", async () => {
  const { collatz } = await get();
  assert.deepEqual(collatz(6), [6, 3, 10, 5, 16, 8, 4, 2, 1]);
});
test("collatz(1) — רק [1]", async () => {
  const { collatz } = await get();
  assert.deepEqual(collatz(1), [1]);
});
test("collatz(27) — 112 מספרים, השיא 9232", async () => {
  const { collatz } = await get();
  const s = collatz(27);
  assert.equal(s.length, 112);
  assert.equal(s[0], 27, "המספר הראשון הוא n עצמו");
  assert.equal(s.at(-1), 1, "המספר האחרון הוא 1");
  assert.equal(Math.max(...s), 9232);
});
test("לולאת while", () => {
  assert.match(code(import.meta.url, "P06-E27.js"), /\bwhile\s*\(/, "התרגיל מתרגל while (פרק 4): אתה לא יודע מראש כמה צעדים יהיו");
});
