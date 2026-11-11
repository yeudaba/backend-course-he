import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E50.ts";
const get = () => exportsOf(import.meta.url, FILE, ["bookLabel", "oldest"]);
const dune = { isbn: "1", title: "דיונה", author: "הרברט", year: 1965 };
const orwell = { isbn: "2", title: "1984", author: "אורוול", year: 1949, subtitle: "רומן" };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוס Book והחתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { bookLabel, oldest } from "FILE";
import type { Book } from "FILE";
const b: Book = { isbn: "1", title: "t", author: "a", year: 2000 };
const withSub: Book = { ...b, subtitle: "s" };
// @ts-expect-error — isbn הוא readonly
b.isbn = "2";
b.title = "אפשר לשנות כותרת";
// @ts-expect-error — year הוא מספר
const badYear: Book = { isbn: "1", title: "t", author: "a", year: "2000" };
// @ts-expect-error — author חובה
const noAuthor: Book = { isbn: "1", title: "t", year: 2000 };
const s: string = bookLabel(b);
const o = oldest([b]);
// @ts-expect-error — oldest יכולה להחזיר undefined
const sure: Book = o;
const t: string | undefined = o?.title;
export { withSub, badYear, noAuthor, s, sure, t };
`);
  assert.ok(r.ok, r.message);
});
test("bookLabel — עם ובלי subtitle", async () => {
  const { bookLabel } = await get();
  assert.equal(bookLabel(dune), "דיונה (הרברט, 1965)");
  assert.equal(bookLabel(orwell), "1984: רומן (אורוול, 1949)");
  assert.equal(bookLabel({ ...dune, subtitle: "" }), "דיונה (הרברט, 1965)", "subtitle ריק — כמו בלי");
});
test("oldest", async () => {
  const { oldest } = await get();
  assert.equal(oldest([dune, orwell]), orwell);
  const twin = { ...orwell, isbn: "3" };
  assert.equal(oldest([dune, orwell, twin]), orwell, "בשוויון — הראשון");
  assert.equal(oldest([]), undefined);
  const list = [dune, orwell];
  oldest(list);
  assert.deepEqual(list, [dune, orwell], "המערך המקורי השתנה");
});
