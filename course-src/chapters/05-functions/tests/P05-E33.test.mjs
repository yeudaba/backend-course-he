import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E33.js";
const get = () => exportsOf(import.meta.url, FILE, ["square"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("7 בריבוע", async () => {
  const { square } = await get();
  assert.equal(square(7), 49);
});
test("שלילי, אפס ושבר", async () => {
  const { square } = await get();
  assert.equal(square(-4), 16, "square(-4)");
  assert.equal(square(0), 0, "square(0)");
  assert.equal(square(1.5), 2.25, "square(1.5)");
});
