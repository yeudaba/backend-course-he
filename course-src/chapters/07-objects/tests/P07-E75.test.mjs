import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E75.js";
const get = () => exportsOf(import.meta.url, FILE, ["commonTags"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("החיתוך, לפי הסדר ב־a", async () => {
  const { commonTags } = await get();
  assert.deepEqual(commonTags(["node", "api", "sql"], ["sql", "node", "redis"]), ["node", "sql"]);
  assert.deepEqual(commonTags(["x", "y"], ["y", "x"]), ["x", "y"]);
});
test("בלי כפילויות", async () => {
  const { commonTags } = await get();
  assert.deepEqual(commonTags(["api", "api", "sql"], ["api", "api"]), ["api"]);
});
test("ריקים", async () => {
  const { commonTags } = await get();
  assert.deepEqual(commonTags(["a"], []), []);
  assert.deepEqual(commonTags([], ["a"]), []);
});
test("עם Set", () => {
  assert.match(src(), /new\s+Set\s*\(/, "השתמש ב־Set");
  assert.match(src(), /\.has\s*\(/, "בדוק שייכות עם has");
});
