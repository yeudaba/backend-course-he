import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E06.js";
const withMinutes = (n) => run(import.meta.url, FILE, { changes: [[/(totalMinutes\s*=\s*)135\b/, `$1${n}`, "את השורה const totalMinutes = 135;"]] });

test("135 דקות = 2 שעות ו־15 דקות", () => {
  sameOutput(run(import.meta.url, FILE), ["135 דקות = 2 שעות ו־15 דקות"]);
});

for (const [n, line] of [
  [59, "59 דקות = 0 שעות ו־59 דקות"],
  [60, "60 דקות = 1 שעות ו־0 דקות"],
  [600, "600 דקות = 10 שעות ו־0 דקות"],
]) {
  test(`עם ${n} דקות`, () => sameOutput(withMinutes(n), [line]));
}

test("משתמשים ב־Math.floor וב־%", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /Math\.floor\(/, "חשב את השעות עם Math.floor");
  assert.match(src, /%/, "חשב את הדקות עם %");
});
