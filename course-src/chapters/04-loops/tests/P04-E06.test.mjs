import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E06.js";

test("10, 7, 4, 1, המראה!", () => sameOutput(run(import.meta.url, FILE), ["10", "7", "4", "1", "המראה!"]));

test("מתחילים מ־11 ← 11, 8, 5, 2", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(let\s+n\s*=\s*)10\b/, "$111", "את השורה let n = 10;"]] });
  sameOutput(r, ["11", "8", "5", "2", "המראה!"]);
});

test("עם while", () => {
  assert.match(code(source(import.meta.url, FILE)), /while\s*\(/, "התרגיל מתרגל while");
});
