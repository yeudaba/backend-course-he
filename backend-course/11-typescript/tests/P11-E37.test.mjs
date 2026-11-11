import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E37.ts";
const get = () => exportsOf(import.meta.url, FILE, ["countWords"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מחזירה Map<string, number>", () => {
  const r = typeProbe(import.meta.url, FILE, `import { countWords } from "FILE";
const m: Map<string, number> = countWords("a b");
// @ts-expect-error — המפתחות הם מחרוזות, לא מספרים
const wrong: Map<number, number> = countWords("a");
// @ts-expect-error — הערכים הם מספרים
const wrong2: Map<string, string> = countWords("a");
export { m, wrong, wrong2 };
`);
  assert.ok(r.ok, r.message);
});
test("ספירה, אותיות קטנות, סדר הופעה", async () => {
  const { countWords } = await get();
  const m = countWords("the cat and The dog");
  assert.ok(m instanceof Map, "צריך להחזיר Map");
  assert.deepEqual([...m], [["the", 2], ["cat", 1], ["and", 1], ["dog", 1]]);
  assert.deepEqual([...countWords("  a  b a   ")], [["a", 2], ["b", 1]], "רווחים כפולים לא יוצרים מילה ריקה");
  assert.equal(countWords("   ").size, 0);
  assert.deepEqual([...countWords("Hi HI hi")], [["hi", 3]]);
});
