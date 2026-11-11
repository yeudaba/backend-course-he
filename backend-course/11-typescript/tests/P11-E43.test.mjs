import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E43.ts";
const get = () => exportsOf(import.meta.url, FILE, ["byLength"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מחזירה Map<number, string[]>", () => {
  const r = typeProbe(import.meta.url, FILE, `import { byLength } from "FILE";
const m: Map<number, string[]> = byLength(["a"]);
// @ts-expect-error — הערכים הם מערכים של מחרוזות
const bad: Map<number, string> = byLength(["a"]);
// @ts-expect-error — מקבלת מערך של מחרוזות
byLength([1, 2]);
export { m, bad };
`);
  assert.ok(r.ok, r.message);
});
test("קיבוץ לפי אורך, מפתחות ממוינים", async () => {
  const { byLength } = await get();
  const words = ["cat", "a", "dog", "bird", "be"];
  const m = byLength(words);
  assert.ok(m instanceof Map, "צריך להחזיר Map");
  assert.deepEqual([...m], [[1, ["a"]], [2, ["be"]], [3, ["cat", "dog"]], [4, ["bird"]]]);
  assert.deepEqual(words, ["cat", "a", "dog", "bird", "be"], "המערך המקורי השתנה");
});
test("10 אחרי 9, כפולות נשארות, ריק", async () => {
  const { byLength } = await get();
  const m = byLength(["abcdefghij", "abcdefghi", "x", "x"]);
  assert.deepEqual([...m.keys()], [1, 9, 10], "מיון מספרי — עם פונקציית השוואה");
  assert.deepEqual(m.get(1), ["x", "x"]);
  assert.equal(byLength([]).size, 0);
});
