import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E72.js";
const get = () => exportsOf(import.meta.url, FILE, ["cleanName"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שמות רגילים", async () => {
  const { cleanName } = await get();
  assert.equal(cleanName("  dANA "), "Dana");
  assert.equal(cleanName("yossi"), "Yossi");
  assert.equal(cleanName("a"), "A");
});
test("ריק ורווחים ← אורח", async () => {
  const { cleanName } = await get();
  assert.equal(cleanName(""), "אורח");
  assert.equal(cleanName("   "), "אורח");
});
