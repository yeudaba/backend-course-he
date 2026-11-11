import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E61.ts";
const get = () => exportsOf(import.meta.url, FILE, ["formatId"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (string | number) => string", () => {
  const r = typeProbe(import.meta.url, FILE, `import { formatId } from "FILE";
const a: string = formatId(1);
const b: string = formatId("x");
// @ts-expect-error — בוליאני אינו מזהה
formatId(true);
// @ts-expect-error — null אינו מזהה
formatId(null);
export { a, b };
`);
  assert.ok(r.ok, r.message);
});
test("מספרים", async () => {
  const { formatId } = await get();
  assert.equal(formatId(42), "#0042");
  assert.equal(formatId(7), "#0007");
  assert.equal(formatId(0), "#0000");
  assert.equal(formatId(1234), "#1234");
  assert.equal(formatId(12345), "#12345");
});
test("מחרוזות", async () => {
  const { formatId } = await get();
  assert.equal(formatId(" ab-7 "), "AB-7");
  assert.equal(formatId("x"), "X");
  assert.equal(formatId("42"), "42", "מחרוזת נשארת מחרוזת — גם אם היא נראית כמו מספר");
});
