import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E18.js";
const withStatus = (n) => run(import.meta.url, FILE, { changes: [[/(status\s*=\s*)403\b/, `$1${n}`, "את השורה const status = 403;"]] });

test("403: אין הרשאה", () => sameOutput(run(import.meta.url, FILE), ["403: אין הרשאה"]));

for (const [n, msg] of [
  [200, "הצלחה"],
  [201, "הצלחה"],
  [400, "בקשה שגויה"],
  [401, "אין הרשאה"],
  [404, "לא נמצא"],
  [500, "תקלה בשרת"],
  [502, "תקלה בשרת"],
  [503, "תקלה בשרת"],
  [418, "קוד לא מוכר"],
]) {
  test(`${n}: ${msg}`, () => sameOutput(withStatus(n), [`${n}: ${msg}`]));
}

test("משתמשים ב־switch", () => {
  assert.match(code(source(import.meta.url, FILE)), /switch\s*\(/, "התרגיל מתרגל switch עם נפילה בין case־ים");
});
