import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, words, assertNoPlaceholders, links } from "./_docs.mjs";

const md = readDoc(import.meta.url, "P30-E06.md");

test("בלי placeholders", () => assertNoPlaceholders(md, "README הפרופיל"));
test("כותרת עם שם, ו־Backend כבר בהתחלה", () => {
  assert.match(md, /^#\s+\S.+$/m, "כותרת # עם השם שלך");
  assert.match(md.slice(0, 400), /backend/i, "בשורות הראשונות — שאתה מפתח Backend");
});
test("קצר: 60 עד 350 מילים", () => {
  const n = words(md).length;
  assert.ok(n >= 60 && n <= 350, `${n} מילים — README של פרופיל נקרא ב־30 שניות`);
});
test("קישורים לשני פרויקטים ב־GitHub, ודרך ליצור קשר", () => {
  const repos = new Set(links(md).filter((l) => /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(l)).map((l) => l.split("/").slice(0, 5).join("/")));
  assert.ok(repos.size >= 2, `קישורים ל־${repos.size} repos — צריך את שני הפרויקטים המרכזיים`);
  assert.ok(/linkedin\.com\/in\/|mailto:|[\w.+-]+@[\w-]+\.[\w.]+/.test(md), "LinkedIn או אימייל");
});
test("לכל תמונה — alt", () => {
  for (const m of md.matchAll(/!\[([^\]]*)\]\(/g)) assert.ok(m[1].trim().length > 0, "תמונה בלי alt text");
});
