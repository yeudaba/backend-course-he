import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, bareCode } from "./_out.mjs";

const FILE = "P04-E82.js";
const withLimit = (n) => run(import.meta.url, FILE, { changes: [[/(limit\s*=\s*)10\b/, `$1${n}`, "את השורה const limit = 10;"]] });
const lines = (sum, skipped) => [`סכום: ${sum}`, `דילגנו על: ${skipped}`];

test("עד 10", () => sameOutput(run(import.meta.url, FILE), lines(37, 3)));
test("עד 1 — אין על מה לדלג", () => sameOutput(withLimit(1), lines(1, 0)));
test("עד 3 — הגבול עצמו הוא כפולה של 3", () => sameOutput(withLimit(3), lines(3, 1)));
test("עד 20", () => sameOutput(withLimit(20), lines(147, 6)));
test("מדלגים עם continue", () => {
  const src = bareCode(source(import.meta.url, FILE));
  assert.match(src, /\bcontinue\b/, "דלג על כפולות של 3 עם continue");
  assert.ok(!/(?<![\d.])37(?![\d.])/.test(src), "המספר 37 כתוב בקוד שלך — הוא צריך להיות מחושב");
});
