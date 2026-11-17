import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E76.ts";
const get = () => exportsOf(import.meta.url, FILE, ["errorMessage"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (unknown) => string", () => {
  const r = typeProbe(import.meta.url, FILE, `import { errorMessage } from "FILE";
const a: string = errorMessage(new Error("x"));
const b: string = errorMessage(42);
try { JSON.parse("{"); } catch (err) { const m: string = errorMessage(err); }
export { a, b };
`);
  assert.ok(r.ok, r.message);
});
test("Error ומחלקות שיורשות", async () => {
  const { errorMessage } = await get();
  assert.equal(errorMessage(new Error("בום")), "בום");
  assert.equal(errorMessage(new RangeError("מחוץ לטווח")), "מחוץ לטווח");
  class MyErr extends Error {}
  assert.equal(errorMessage(new MyErr("שלי")), "שלי");
  assert.equal(errorMessage(new Error("")), "", "Error עם הודעה ריקה — ההודעה שלו (גם אם ריקה)");
});
test("מחרוזות ואובייקטים עם message", async () => {
  const { errorMessage } = await get();
  assert.equal(errorMessage("נגמר המלאי"), "נגמר המלאי");
  assert.equal(errorMessage({ message: "מהשרת", code: 7 }), "מהשרת");
});
test("כל השאר ← שגיאה לא ידועה", async () => {
  const { errorMessage } = await get();
  for (const v of ["", 42, null, undefined, { message: 5 }, { msg: "x" }, ["x"], true]) {
    assert.equal(errorMessage(v), "שגיאה לא ידועה", `errorMessage(${JSON.stringify(v)})`);
  }
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as — narrowing בלבד");
});
