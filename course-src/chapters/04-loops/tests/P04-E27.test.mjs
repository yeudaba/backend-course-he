import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E27.js";
const withStatuses = (s) => run(import.meta.url, FILE, { changes: [[/(statuses\s*=\s*)(["'`]).*?\2/, `$1"${s}"`, "את השורה const statuses = ...;"]] });

test("PPDCPD", () => sameOutput(run(import.meta.url, FILE), ["שולמו: 3 | נמסרו: 2 | בוטלו: 1 | לא מוכר: 0"]));
test("סטטוס לא מוכר (X) נספר בנפרד", () => sameOutput(withStatuses("PDXPC"), ["שולמו: 2 | נמסרו: 1 | בוטלו: 1 | לא מוכר: 1"]));
test("אותיות קטנות לא מוכרות (switch משווה עם ===)", () => sameOutput(withStatuses("pP"), ["שולמו: 1 | נמסרו: 0 | בוטלו: 0 | לא מוכר: 1"]));
test("מחרוזת ריקה — הכול 0", () => sameOutput(withStatuses(""), ["שולמו: 0 | נמסרו: 0 | בוטלו: 0 | לא מוכר: 0"]));

test("לולאה ו־switch", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /\bfor\s*\(|\bwhile\s*\(/, "עוברים על התווים בלולאה");
  assert.match(src, /switch\s*\(/, "התרגיל מתרגל switch (פרק 3) — נסה בלי if");
});
