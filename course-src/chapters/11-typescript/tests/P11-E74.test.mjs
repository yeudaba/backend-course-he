import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E74.ts";
const get = () => exportsOf(import.meta.url, FILE, ["isStringArray", "tagsOf"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("isStringArray הוא type guard", () => {
  const r = typeProbe(import.meta.url, FILE, `import { isStringArray, tagsOf } from "FILE";
const v: unknown = ["a"];
// @ts-expect-error — לפני הבדיקה v הוא unknown
v.map((s: string) => s);
if (isStringArray(v)) {
  const first: string | undefined = v[0];
  v.map((s) => s.toUpperCase());
}
const t: string[] = tagsOf(v);
export { t };
`);
  assert.ok(r.ok, r.message);
});
test("isStringArray", async () => {
  const { isStringArray } = await get();
  assert.equal(isStringArray(["a", "b"]), true);
  assert.equal(isStringArray([]), true, "מערך ריק — כל האיברים (אף אחד) מחרוזות");
  for (const bad of [["a", 1], [null], "ab", null, undefined, { 0: "a", length: 1 }, [["a"]], 5]) {
    assert.equal(isStringArray(bad), false, `isStringArray(${JSON.stringify(bad)}) צריך להיות false`);
  }
});
test("tagsOf", async () => {
  const { tagsOf } = await get();
  const input = ["New", "SALE"];
  assert.deepEqual(tagsOf(input), ["new", "sale"]);
  assert.deepEqual(input, ["New", "SALE"], "צריך עותק — המקור לא משתנה");
  assert.deepEqual(tagsOf("new"), []);
  assert.deepEqual(tagsOf(["a", 2]), []);
  assert.deepEqual(tagsOf(null), []);
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as — narrowing בלבד");
});
