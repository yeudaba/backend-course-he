import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E10.js";

test("FizzBuzz מ־1 עד 15", () => {
  sameOutput(run(import.meta.url, FILE), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
});

test("לולאה אחת, לא 15 שורות הדפסה", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /for\s*\(|while\s*\(/, "צריך לולאה");
  assert.ok((src.match(/console\.log\(/g)?.length ?? 0) <= 4, "יותר מ־4 קריאות ל־console.log — כתוב לולאה, לא את הפלט ביד");
});
