import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, bareCode } from "./_out.mjs";

const FILE = "P03-E82.js";
const withYear = (y) => run(import.meta.url, FILE, { changes: [[/(year\s*=\s*)1900\b/, `$1${y}`, "את השורה const year = 1900;"]] });

for (const [y, leap, why] of [
  [1900, false, "מתחלקת ב־100 ולא ב־400"],
  [2024, true, "מתחלקת ב־4 ולא ב־100"],
  [2023, false, "לא מתחלקת ב־4"],
  [2000, true, "מתחלקת ב־400"],
  [2100, false, "מתחלקת ב־100 ולא ב־400"],
]) {
  test(`${y} — ${why}`, () => sameOutput(y === 1900 ? run(import.meta.url, FILE) : withYear(y), [`${y} מעוברת? ${leap}`]));
}

test("ביטוי אחד עם && ו־||, בלי if", () => {
  const src = bareCode(source(import.meta.url, FILE));
  assert.doesNotMatch(src, /\bif\s*\(|\bswitch\s*\(|(?<!\?)\?(?![?.])/, "בלי if, ternary או switch — כל הכלל בביטוי בוליאני אחד");
  assert.match(src, /\bisLeap\s*=/, "שמור את התשובה במשתנה isLeap");
  assert.match(src, /&&/, "חסר && — \"מתחלקת ב־4 וגם לא ב־100\"");
  assert.match(src, /\|\|/, "חסר || — \"... או מתחלקת ב־400\"");
});
