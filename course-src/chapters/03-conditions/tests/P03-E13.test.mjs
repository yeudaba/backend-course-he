import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E13.js";
const withWeight = (w) => run(import.meta.url, FILE, { changes: [[/(weight\s*=\s*)23\.4\b/, `$1${w}`, "את השורה const weight = 23.4;"]] });

test("משקל 23.4 ק״ג: 90 ש״ח", () => sameOutput(run(import.meta.url, FILE), ["משקל 23.4 ק״ג: 90 ש״ח"]));

for (const [w, price] of [
  [1, 25],
  [1.01, 40],
  [5, 40],
  [20, 70],
  [20.1, 75],
  [21, 75],
]) {
  test(`משקל ${w} ק״ג: ${price} ש״ח`, () => sameOutput(withWeight(w), [`משקל ${w} ק״ג: ${price} ש״ח`]));
}

test("משקל 0 ← שגיאה", () => sameOutput(withWeight(0), ["שגיאה: משקל חייב להיות חיובי"]));
test("משקל שלילי ← שגיאה", () => sameOutput(withWeight(-2), ["שגיאה: משקל חייב להיות חיובי"]));
