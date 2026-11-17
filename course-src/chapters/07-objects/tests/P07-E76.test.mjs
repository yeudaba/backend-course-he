import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E76.js";
const get = () => exportsOf(import.meta.url, FILE, ["firstRepeated"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("הכפול הראשון", async () => {
  const { firstRepeated } = await get();
  assert.equal(firstRepeated(["a", "b", "c", "b", "a"]), "b");
  assert.equal(firstRepeated(["x", "x"]), "x");
  assert.equal(firstRepeated(["p", "q", "r", "r", "q"]), "r");
});
test("בלי תלות באותיות גדולות", async () => {
  const { firstRepeated } = await get();
  assert.equal(firstRepeated(["Node", "api", "NODE"]), "node");
});
test("אין חזרה", async () => {
  const { firstRepeated } = await get();
  assert.equal(firstRepeated(["x", "y"]), null);
  assert.equal(firstRepeated([]), null);
});
