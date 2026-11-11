import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E34.js";
const get = () => exportsOf(import.meta.url, FILE, ["middle"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("אורך אי־זוגי", async () => {
  const { middle } = await get();
  assert.equal(middle([1, 2, 3]), 2);
  assert.equal(middle([10, 20, 30, 40, 50]), 30);
  assert.equal(middle([7]), 7);
});
test("אורך זוגי — הימני מבין השניים", async () => {
  const { middle } = await get();
  assert.equal(middle(["a", "b", "c", "d"]), "c");
  assert.equal(middle([5, 6]), 6);
});
test("מערך ריק", async () => {
  const { middle } = await get();
  assert.equal(middle([]), undefined);
});
