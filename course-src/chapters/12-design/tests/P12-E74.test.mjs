import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P12-E74.ts";
const get = () => exportsOf(import.meta.url, FILE, ["ValidationError", "parseProductPatch"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseProductPatch } from "FILE";
import type { ProductPatch } from "FILE";
const p: ProductPatch = parseProductPatch({});
const n: string | undefined = p.name;
const empty: ProductPatch = {};
// @ts-expect-error — price הוא מספר
const bad: ProductPatch = { price: "5" };
export { n, empty, bad };
`);
  assert.ok(r.ok, r.message);
});
test("רק השדות שנשלחו, מנורמלים", async () => {
  const { parseProductPatch } = await get();
  assert.deepEqual(parseProductPatch({ price: 19.9 }), { price: 19.9 });
  const r = parseProductPatch({ name: "  עט כחול ", tags: ["New", " sale"] });
  assert.deepEqual(r, { name: "עט כחול", tags: ["new", "sale"] });
  assert.ok(!("price" in r), "שדה שלא נשלח לא מופיע בתוצאה (גם לא כ־undefined)");
  assert.deepEqual(parseProductPatch({ tags: [] }), { tags: [] });
  assert.deepEqual(parseProductPatch({ price: 0.01, name: "x" }), { price: 0.01, name: "x" });
});
test("שגיאות עם field נכון", async () => {
  const { parseProductPatch, ValidationError } = await get();
  const cases = [
    [null, "body", "גוף הבקשה חייב להיות אובייקט"],
    [[], "body", "גוף הבקשה חייב להיות אובייקט"],
    ["x", "body", "גוף הבקשה חייב להיות אובייקט"],
    [{}, "body", "אין מה לעדכן"],
    [{ name: "x", stock: 5 }, "stock", "שדה לא מוכר: stock"],
    [{ name: "  " }, "name", "name לא תקין"],
    [{ name: 5 }, "name", "name לא תקין"],
    [{ price: 0 }, "price", "price לא תקין"],
    [{ price: -3 }, "price", "price לא תקין"],
    [{ price: 1.999 }, "price", "price לא תקין"],
    [{ price: "5" }, "price", "price לא תקין"],
    [{ price: NaN }, "price", "price לא תקין"],
    [{ tags: "a" }, "tags", "tags לא תקין"],
    [{ tags: ["a", ""] }, "tags", "tags לא תקין"],
    [{ tags: ["a", 1] }, "tags", "tags לא תקין"],
    [{ tags: ["a", " A "] }, "tags", "tags לא תקין"],
  ];
  for (const [input, field, message] of cases) {
    assert.throws(() => parseProductPatch(input), (e) => e instanceof ValidationError && e.field === field && e.message === message, `${JSON.stringify(input)} ← ${field}: ${message}`);
  }
});
test("בלי any", () => {
  assert.ok(!/\bany\b/.test(code(import.meta.url, FILE)), "בלי any");
});
