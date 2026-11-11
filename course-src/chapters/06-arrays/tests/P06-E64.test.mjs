import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E64.js";
const get = () => exportsOf(import.meta.url, FILE, ["search","countMatches"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("חיפוש בלי תלות באותיות", async () => {
  const { search } = await get();
  const products = ["Laptop Pro", "USB cable", "laptop stand", "Mouse"];
  assert.deepEqual(search(products, "laptop"), ["Laptop Pro", "laptop stand"]);
  assert.deepEqual(search(products, "LAPTOP"), ["Laptop Pro", "laptop stand"]);
  assert.deepEqual(search(products, "  USB "), ["USB cable"]);
  assert.deepEqual(search(products, "phone"), []);
  assert.deepEqual(search(products, "o"), ["Laptop Pro", "laptop stand", "Mouse"]);
});
test("שאילתה ריקה ← עותק של הכול", async () => {
  const { search } = await get();
  const products = ["a", "b"];
  const r = search(products, "  ");
  assert.deepEqual(r, ["a", "b"]);
  assert.notEqual(r, products, "צריך להחזיר מערך חדש, לא את המקורי");
});
test("countMatches", async () => {
  const { countMatches } = await get();
  assert.equal(countMatches(["Laptop", "laptop bag", "Mouse"], "LAP"), 2);
  assert.equal(countMatches(["a"], "z"), 0);
});
test("filter, ו־countMatches משתמשת ב־search", () => {
  assert.match(src(), /\.filter\s*\(/, "השתמש ב־filter");
  assert.match(src(), /function\s+countMatches[\s\S]*search\s*\(|countMatches\s*=[\s\S]*search\s*\(/, "countMatches צריכה לקרוא ל־search");
});
