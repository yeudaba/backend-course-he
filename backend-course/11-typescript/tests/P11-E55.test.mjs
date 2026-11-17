import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E55.ts";
const get = () => exportsOf(import.meta.url, FILE, ["sortBy", "topN"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("generic: התוצאה מאותו סוג כמו הקלט", () => {
  const r = typeProbe(import.meta.url, FILE, `import { sortBy, topN } from "FILE";
const people = [{ n: "a", age: 1 }];
const sorted = sortBy(people, (p) => p.age);
const firstName: string = sorted[0].n;
// @ts-expect-error — אין שדה nn (התוצאה צריכה להיות מערך של אותו טיפוס, לא any)
sorted[0].nn;
// @ts-expect-error — key חייבת להחזיר מספר
sortBy(people, (p) => p.n);
const words: string[] = topN(["a"], (s) => s.length, 1);
// @ts-expect-error — topN על מחרוזות מחזירה string[]
const nums: number[] = topN(["a"], (s) => s.length, 1);
export { firstName, words, nums };
`);
  assert.ok(r.ok, r.message);
});
test("sortBy — עותק ממוין, יציב", async () => {
  const { sortBy } = await get();
  const people = [{ n: "b", age: 30 }, { n: "a", age: 20 }, { n: "c", age: 20 }, { n: "d", age: 5 }];
  assert.deepEqual(sortBy(people, (p) => p.age).map((p) => p.n), ["d", "a", "c", "b"]);
  assert.deepEqual(people.map((p) => p.n), ["b", "a", "c", "d"], "המקור השתנה — העתק לפני sort");
  assert.deepEqual(sortBy([10, 9, 100, 1], (x) => x), [1, 9, 10, 100], "מיון מספרי");
  assert.deepEqual(sortBy([], (x) => x), []);
});
test("topN — מהגבוה לנמוך", async () => {
  const { topN } = await get();
  const words = ["ccc", "a", "bb", "dddd"];
  assert.deepEqual(topN(words, (s) => s.length, 2), ["dddd", "ccc"]);
  assert.deepEqual(topN(words, (s) => s.length, 10), ["dddd", "ccc", "bb", "a"]);
  assert.deepEqual(topN(words, (s) => s.length, 0), []);
  assert.deepEqual(words, ["ccc", "a", "bb", "dddd"]);
});
