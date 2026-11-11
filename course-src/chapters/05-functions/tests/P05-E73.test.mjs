import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E73.js";
const get = () => exportsOf(import.meta.url, FILE, ["formatRow"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("רוחב ברירת מחדל", async () => {
  const { formatRow } = await get();
  const r = formatRow("משלוח", "29.90");
  assert.equal(r, "משלוח..............29.90");
  assert.equal(r.length, 24);
});
test("רוחב אחר", async () => {
  const { formatRow } = await get();
  assert.equal(formatRow("סה״כ", "100", 10), "סה״כ...100");
  assert.equal(formatRow("a", "b", 3), "a.b");
});
test("ארוך מדי", async () => {
  const { formatRow } = await get();
  assert.equal(formatRow("תווית ארוכה מאוד", "123.45", 10), "תווית ארוכה מאוד 123.45");
  assert.equal(formatRow("abcde", "12345", 10), "abcde 12345", "בדיוק width — אין מקום לנקודה, אז רווח");
});
