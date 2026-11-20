import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, bareCode } from "./_out.mjs";

const FILE = "P02-E82.js";
const bare = () => bareCode(source(import.meta.url, FILE));
const withEggs = (n) => run(import.meta.url, FILE, { changes: [[/(eggs\s*=\s*)50\b/, `$1${n}`, "את השורה const eggs = 50;"]] });
const lines = (full, left, boxes) => [`קרטונים מלאים: ${full}`, `ביצים בחוץ: ${left}`, `קרטונים לכל הביצים: ${boxes}`];

test("50 ביצים", () => sameOutput(run(import.meta.url, FILE), lines(4, 2, 5)));
test("12 ביצים — קרטון אחד מלא, בלי קרטון נוסף", () => sameOutput(withEggs(12), lines(1, 0, 1)));
test("13 ביצים — ביצה אחת צריכה קרטון משלה", () => sameOutput(withEggs(13), lines(1, 1, 2)));
test("7 ביצים — אף קרטון לא מלא", () => sameOutput(withEggs(7), lines(0, 7, 1)));
test("0 ביצים", () => sameOutput(withEggs(0), lines(0, 0, 0)));
test("התוצאות מחושבות", () => {
  for (const n of [4, 2, 5]) assert.ok(!new RegExp(`(?<![\\d.])${n}(?![\\d.])`).test(bare()), `המספר ${n} כתוב בקוד שלך — הוא צריך להיות מחושב מ־eggs`);
});
