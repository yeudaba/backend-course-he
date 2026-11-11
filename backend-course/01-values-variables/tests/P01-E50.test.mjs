import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E50.js";
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מנה 1: 58", "מנה 2: 46", "מנה 3: 36", "סה״כ: 140", "סועדים: 4", "לכל סועד: 35", "סוג: number"]);
});

test("הסה״כ והחלק של כל סועד מחושבים", () => {
  const src = bare(source(import.meta.url, FILE));
  for (const n of ["140", "35"]) assert.ok(!new RegExp(`(?<![\\d.])${n}(?![\\d.])`).test(src), `${n} כתוב בקוד — הוא צריך להיות מחושב`);
  assert.match(src, /const\s+diners\s*=/, "לא מצאנו const diners = ... — מספר הסועדים נשמר במשתנה בשם diners");
});

test("עם 5 סועדים — כל אחד משלם 28", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(diners\s*=\s*)4\b/, "$15", "את const diners = 4"]] });
  sameOutput(r, ["מנה 1: 58", "מנה 2: 46", "מנה 3: 36", "סה״כ: 140", "סועדים: 5", "לכל סועד: 28", "סוג: number"]);
});
