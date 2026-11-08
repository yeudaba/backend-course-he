import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, words, assertNoPlaceholders, section } from "./_docs.mjs";

const md = readDoc(import.meta.url, "P30-E12.md");

test("בלי placeholders; שני חלקים", () => {
  assertNoPlaceholders(md, "ה־pitch");
  assert.ok(section(md, "עברית"), "## עברית");
  assert.ok(section(md, "English"), "## English");
});
test("שתי דקות: עברית 140–280 מילים, English 200–330", () => {
  // בעברית יש פחות מילים לאותו משפט (ו־, ה־, ב־ צמודות למילה)
  for (const [s, min, max] of [["עברית", 140, 280], ["English", 200, 330]]) {
    const n = words(section(md, s) ?? "").length;
    assert.ok(n >= min && n <= max, `${s}: ${n} מילים (צריך ${min}–${max} — בערך שתי דקות דיבור)`);
  }
});
test("יש מספר, נימוק להחלטה, ומה הלאה", () => {
  const he = section(md, "עברית") ?? "";
  const en = section(md, "English") ?? "";
  assert.match(he, /\d/, "עברית: מספר אחד לפחות");
  assert.match(en, /\d/, "English: at least one number");
  assert.match(he, /(^|[^\u0590-\u05FF])כי([^\u0590-\u05FF]|$)|בגלל|מכיוון/, "עברית: למה בחרת (כי…)");
  assert.match(en, /\bbecause\b|\bso that\b/i, "English: why (because…)");
  assert.match(he, /הייתי|הבא|הלאה|עם עוד זמן/, "עברית: מה היית משפר");
  assert.match(en, /\bwould\b|\bnext\b/i, "English: what you'd improve");
});
