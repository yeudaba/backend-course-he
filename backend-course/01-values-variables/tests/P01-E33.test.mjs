import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E33.js";
// הקוד בלי הערות ובלי התוכן של המחרוזות — כדי לבדוק מה כתבת מחוץ למירכאות
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["12 + 14 = 26", "100 - 35 = 65", "10 / 4 = 2.5"]);
});

test("התוצאות לא כתובות בקוד — JavaScript מחשבת אותן", () => {
  const src = bare(source(import.meta.url, FILE));
  for (const n of ["26", "65", "2.5"]) {
    assert.ok(!new RegExp(`(^|[^\\d.])${n.replace(".", "\\.")}(?![\\d.])`).test(src), `התוצאה ${n} כתובה בקוד (מחוץ למירכאות) — היא צריכה להיות מחושבת`);
  }
});

test("אם משנים את החשבון 100 - 35 ל־100 - 40 — התוצאה משתנה ל־60", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(,\s*100\s*-\s*)35\b/, "$140", "את החשבון 100 - 35 (אחרי הפסיק)"]] });
  sameOutput(r, ["12 + 14 = 26", "100 - 35 = 60", "10 / 4 = 2.5"]);
});
