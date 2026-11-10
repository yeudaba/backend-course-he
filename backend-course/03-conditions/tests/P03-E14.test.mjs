import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E14.js";
const withYear = (y) => run(import.meta.url, FILE, { changes: [[/(year\s*=\s*)1900\b/, `$1${y}`, "את השורה const year = 1900;"]] });

for (const [y, kind] of [
  [1900, "רגילה"],
  [2024, "מעוברת"],
  [2023, "רגילה"],
  [2000, "מעוברת"],
  [2100, "רגילה"],
]) {
  test(`${y}: ${kind} — בשתי הגרסאות`, () => sameOutput(y === 1900 ? run(import.meta.url, FILE) : withYear(y), [`${y}: ${kind}`, `${y}: ${kind}`]));
}

test("שתי גרסאות: if / else if, וביטוי אחד עם && ו־||", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /else\s+if/, "גרסה 1 צריכה if / else if");
  assert.match(src, /&&/, "גרסה 2: ביטוי אחד עם &&");
  assert.match(src, /\|\|/, "גרסה 2: ביטוי אחד עם ||");
});
