import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E42.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseNumbers", "sumLine"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseNumbers, sumLine } from "FILE";
const a: number[] = parseNumbers("1,2");
const b: number = sumLine("1,2");
// @ts-expect-error — parseNumbers מחזירה number[], לא string[]
const c: string[] = parseNumbers("1");
// @ts-expect-error — מקבלות מחרוזת
sumLine(["1"]);
export { a, b, c };
`);
  assert.ok(r.ok, r.message);
});
test("parseNumbers", async () => {
  const { parseNumbers } = await get();
  assert.deepEqual(parseNumbers("10, 2.5,abc,, -3 "), [10, 2.5, -3]);
  assert.deepEqual(parseNumbers(""), []);
  assert.deepEqual(parseNumbers(",,,"), [], "ערכים ריקים לא הופכים ל־0");
  assert.deepEqual(parseNumbers("0, 1e3 ,x1"), [0, 1000]);
});
test("sumLine", async () => {
  const { sumLine } = await get();
  assert.equal(sumLine("10, 2.5,abc,, -3 "), 9.5);
  assert.equal(sumLine(""), 0);
  assert.equal(sumLine("a,b"), 0);
  assert.equal(sumLine("1,2,3,4"), 10);
});
