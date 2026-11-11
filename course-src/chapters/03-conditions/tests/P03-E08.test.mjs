import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E08.js";
const withScore = (n) => run(import.meta.url, FILE, { changes: [[/(score\s*=\s*)82\b/, `$1${n}`, "את השורה const score = 82;"]] });

test("ציון 82: טוב מאוד", () => sameOutput(run(import.meta.url, FILE), ["ציון 82: טוב מאוד"]));

for (const [n, label] of [
  [100, "מצוין"],
  [90, "מצוין"],
  [89, "טוב מאוד"],
  [80, "טוב מאוד"],
  [79, "טוב"],
  [65, "טוב"],
  [64, "עובר"],
  [55, "עובר"],
  [54, "נכשל"],
  [0, "נכשל"],
  [101, "ציון לא חוקי"],
  [-1, "ציון לא חוקי"],
]) {
  test(`ציון ${n}: ${label}`, () => sameOutput(withScore(n), [`ציון ${n}: ${label}`]));
}
