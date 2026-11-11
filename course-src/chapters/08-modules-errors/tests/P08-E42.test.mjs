import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E42.mjs";
const get = () => exportsOf(import.meta.url, FILE, ["groupBy"], "export");
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("groupBy", async () => {
  const { groupBy } = await get();
  const g = groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd"));
  assert.ok(g instanceof Map, "groupBy צריכה להחזיר Map");
  assert.deepEqual([...g], [["odd", [1, 3]], ["even", [2, 4]]]);
  assert.deepEqual([...groupBy(["a", "bb", "cc"], (w) => w.length)], [[1, ["a"]], [2, ["bb", "cc"]]], "ב־Map המפתח נשאר מספר");
  assert.equal(groupBy([], (x) => x).size, 0);
});
test("countByStatus הוא ה־default", async () => {
  const mod = await get();
  assert.equal(typeof mod.default, "function", "export default function countByStatus(...)");
  assert.deepEqual(mod.default([{ status: "paid" }, { status: "new" }, { status: "paid" }]), { paid: 2, new: 1 });
  assert.deepEqual(mod.default([]), {});
});
test("countByStatus משתמשת ב־groupBy", () => {
  assert.match(src(), /function\s+countByStatus[\s\S]*groupBy\s*\(/, "countByStatus צריכה לקרוא ל־groupBy");
});
