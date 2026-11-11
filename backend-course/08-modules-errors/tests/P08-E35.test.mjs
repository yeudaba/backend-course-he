import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E35.mjs";
const get = () => exportsOf(import.meta.url, FILE, ["initials","greet"], "export");
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("ייצוא בשם", async () => {
  const { initials, greet } = await get();
  assert.equal(initials("dana levi"), "D.L");
  assert.equal(initials("  omer  ben  david "), "O.B.D");
  assert.equal(greet("נועה"), "שלום, נועה!");
});
test("formatUser הוא ייצוא ה־default", async () => {
  const mod = await get();
  assert.equal(typeof mod.default, "function", "export default function formatUser(...)");
  assert.equal(mod.default({ name: "dana levi" }), "dana levi (D.L)");
});
test("בלי module.exports", () => {
  assert.doesNotMatch(src(), /module\.exports/, "בקובץ .mjs אין module.exports — רק export");
});
