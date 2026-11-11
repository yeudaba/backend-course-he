import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E20-assign.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["קוד: WINTER", "הנחה: 0"]);
});

test("עם הקופון SUMMER10 — הנחה של 10", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [['"WINTER"', '"SUMMER10"', 'את הקופון "WINTER"']] }), ["קוד: SUMMER10", "הנחה: 10"]);
});

test("השוואה ב־=== בתנאי", () => {
  const c = code(source(import.meta.url, FILE));
  assert.match(c, /if\s*\(\s*coupon\s*===/, "בתנאי צריך להשוות עם === (סימן = אחד הוא הצבה)");
});
