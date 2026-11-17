import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E62.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseSize", "surcharge"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוס Size והחתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseSize, surcharge } from "FILE";
import type { Size } from "FILE";
const s: Size = "XL";
// @ts-expect-error — "XXL" אינה מידה
const bad: Size = "XXL";
// @ts-expect-error — אותיות קטנות אינן Size (רק parseSize מנרמלת)
const lower: Size = "m";
const p = parseSize("m");
// @ts-expect-error — parseSize יכולה להחזיר null
surcharge(p);
if (p !== null) surcharge(p);
// @ts-expect-error — surcharge מקבלת Size, לא מחרוזת כלשהי
surcharge("M" as string);
const n: number = surcharge("S");
export { s, bad, lower, n };
`);
  assert.ok(r.ok, r.message);
});
test("parseSize", async () => {
  const { parseSize } = await get();
  assert.equal(parseSize(" m "), "M");
  assert.equal(parseSize("xl"), "XL");
  assert.equal(parseSize("S"), "S");
  assert.equal(parseSize("l"), "L");
  for (const bad of ["XXL", "", " ", "medium", "x l"]) assert.equal(parseSize(bad), null, `parseSize(${JSON.stringify(bad)}) צריכה להחזיר null`);
});
test("surcharge עם never", async () => {
  const { surcharge } = await get();
  assert.deepEqual(["S", "M", "L", "XL"].map(surcharge), [0, 0, 5, 10]);
  assert.match(code(import.meta.url, FILE), /never/, "התרגיל מבקש default עם never ב־surcharge");
});
