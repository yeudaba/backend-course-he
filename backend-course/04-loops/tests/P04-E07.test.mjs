import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E07.js";
const table = (b) => Array.from({ length: 10 }, (_, i) => `${b} × ${i + 1} = ${b * (i + 1)}`);

test("לוח הכפל של 7", () => sameOutput(run(import.meta.url, FILE), table(7)));

test("עם base = 9 — לוח הכפל של 9", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [[/(base\s*=\s*)7\b/, "$19", "את השורה const base = 7;"]] }), table(9));
});

test("עם for, והדפסה אחת בתוך הלולאה", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /for\s*\(/, "התרגיל מתרגל for");
  assert.equal(src.match(/console\.log\(/g)?.length ?? 0, 1, "צריך console.log אחד — בתוך הלולאה");
});
