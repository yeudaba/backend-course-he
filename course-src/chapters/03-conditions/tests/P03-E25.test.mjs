import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, printed } from "./_out.mjs";

const FILE = "P03-E25.js";
const date = (d, m, y) =>
  run(import.meta.url, FILE, {
    changes: [
      [/(const\s+day\s*=\s*)[\d.]+/, `$1${d}`, "את const day = ..."],
      [/(const\s+month\s*=\s*)[\d.]+/, `$1${m}`, "את const month = ..."],
      [/(const\s+year\s*=\s*)[\d.]+/, `$1${y}`, "את const year = ..."],
    ],
  });

for (const [d, m, y] of [
  [29, 2, 2024],
  [29, 2, 2000],
  [31, 12, 2025],
  [30, 4, 2025],
  [1, 1, 1900],
]) {
  test(`${d}/${m}/${y} — חוקי`, () => sameOutput(date(d, m, y), [`${d}/${m}/${y}: תאריך חוקי`]));
}

for (const [d, m, y, why] of [
  [31, 4, 2025, "לאפריל יש 30 ימים"],
  [29, 2, 2023, "2023 לא מעוברת"],
  [29, 2, 1900, "1900 לא מעוברת (מתחלקת ב־100)"],
  [0, 5, 2025, "אין יום 0"],
  [15, 13, 2025, "אין חודש 13"],
  [1.5, 3, 2025, "יום לא שלם"],
  [1, 1, 2101, "שנה מחוץ לטווח"],
]) {
  test(`${d}/${m}/${y} — לא חוקי (${why})`, () => {
    const r = date(d, m, y);
    printed(r);
    assert.equal(r.lines.length, 1, "ציפינו לשורה אחת");
    assert.ok(r.lines[0].startsWith(`${d}/${m}/${y}: `), `השורה צריכה להתחיל ב־"${d}/${m}/${y}: "`);
    assert.ok(!r.lines[0].includes("תאריך חוקי"), `${d}/${m}/${y} הוא לא תאריך חוקי`);
  });
}
