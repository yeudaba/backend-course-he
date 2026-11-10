import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E12.js";
const withDay = (n) => run(import.meta.url, FILE, { changes: [[/(const\s+day\s*=\s*)6\b/, `$1${n}`, "את השורה const day = 6;"]] });

test("יום 6: שישי (סוף שבוע)", () => sameOutput(run(import.meta.url, FILE), ["יום 6: שישי (סוף שבוע)"]));

for (const [n, line] of [
  [1, "יום 1: ראשון"],
  [2, "יום 2: שני"],
  [3, "יום 3: שלישי"],
  [4, "יום 4: רביעי"],
  [5, "יום 5: חמישי"],
  [7, "יום 7: שבת (סוף שבוע)"],
  [0, "יום לא חוקי"],
  [8, "יום לא חוקי"],
]) {
  test(line + (n === 0 || n === 8 ? ` (${n})` : ""), () => sameOutput(withDay(n), [line]));
}

test("משתמשים ב־switch", () => {
  assert.match(code(source(import.meta.url, FILE)), /switch\s*\(/, "התרגיל מתרגל switch");
});
