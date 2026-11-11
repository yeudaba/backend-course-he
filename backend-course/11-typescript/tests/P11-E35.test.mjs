import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E35.ts";
const get = () => exportsOf(import.meta.url, FILE, ["initials"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (string) => string", () => {
  const r = typeProbe(import.meta.url, FILE, `import { initials } from "FILE";
const s: string = initials("a b");
// @ts-expect-error — מקבלת מחרוזת אחת, לא מערך
initials(["a", "b"]);
// @ts-expect-error — מחזירה string
const n: number = initials("a");
export { s, n };
`);
  assert.ok(r.ok, r.message);
});
test("ראשי תיבות", async () => {
  const { initials } = await get();
  assert.equal(initials("dana cohen"), "D.C.");
  assert.equal(initials("  Omer   ben  ami "), "O.B.A.");
  assert.equal(initials("x"), "X.");
  assert.equal(initials(""), "");
  assert.equal(initials("   "), "");
  assert.equal(initials("דנה כהן"), "ד.כ.");
});
