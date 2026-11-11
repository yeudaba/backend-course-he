import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E34.ts";
const get = () => exportsOf(import.meta.url, FILE, ["priceWithVat"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (number, number) => number", () => {
  const r = typeProbe(import.meta.url, FILE, `import { priceWithVat } from "FILE";
const n: number = priceWithVat(100, 0.18);
// @ts-expect-error — price הוא number, לא מחרוזת
priceWithVat("100", 0.18);
// @ts-expect-error — vat הוא number
priceWithVat(100, "0.18");
// @ts-expect-error — התוצאה היא number, לא string
const s: string = priceWithVat(1, 0);
export { n, s };
`);
  assert.ok(r.ok, r.message);
});
test("מחיר כולל מע״מ, מעוגל לשתי ספרות", async () => {
  const { priceWithVat } = await get();
  assert.equal(priceWithVat(100, 0.18), 118);
  assert.equal(priceWithVat(9.99, 0.17), 11.69);
  assert.equal(priceWithVat(0, 0.18), 0);
  assert.equal(priceWithVat(19.9, 0), 19.9);
  assert.equal(priceWithVat(33.33, 0.18), 39.33);
});
