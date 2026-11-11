import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source } from "./_out.mjs";

const FILE = "P01-E07.js";

test("מודפסות רק השורות ב ו־ד", () => {
  sameOutput(run(import.meta.url, FILE), ["ב", "ד"]);
});

test("אף שורה לא נמחקה — רק כובתה בהערה", () => {
  const src = source(import.meta.url, FILE);
  for (const letter of ["א", "ב", "ג", "ד"]) {
    assert.ok(src.includes(`console.log("${letter}");`), `השורה console.log("${letter}"); לא נמצאת בקובץ — אסור למחוק, רק להוסיף //`);
  }
});

test("יש הערה שמסבירה למה כיבית את השורות", () => {
  // ההערות שבראש הקובץ הן של התרגיל — מחפשים הערה משלך, חוץ מהן ומהשורות שכובו
  const header = /^\s*\/\/\s*(P01-E07|בלי למחוק אף תו|הוסף הערה שמסבירה|הרצה:|בדיקה:)/;
  const explain = source(import.meta.url, FILE)
    .split("\n")
    .filter((l) => /^\s*\/\/(?!\s*console\.log)\s*\S/.test(l) && !header.test(l));
  assert.ok(explain.length > 0, "לא מצאנו שורת הערה משלך (חוץ מהשורות שכובו). הוסף הערה שמסבירה למה כיבית");
});
