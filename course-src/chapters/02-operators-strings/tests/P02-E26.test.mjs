import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E26.js";
const withAgorot = (n) => run(import.meta.url, FILE, { changes: [[/(agorot\s*=\s*)1234\b/, `$1${n}`, "את השורה const agorot = 1234;"]] });

test("1234 אגורות = 12 ₪ ו־34 אג׳", () => {
  sameOutput(run(import.meta.url, FILE), ["1234 אגורות = 12 ₪ ו־34 אג׳"]);
});

test("5 אגורות = 0 ₪ ו־5 אג׳", () => sameOutput(withAgorot(5), ["5 אגורות = 0 ₪ ו־5 אג׳"]));
test("100 אגורות = 1 ₪ ו־0 אג׳", () => sameOutput(withAgorot(100), ["100 אגורות = 1 ₪ ו־0 אג׳"]));
test("99999 אגורות = 999 ₪ ו־99 אג׳", () => sameOutput(withAgorot(99999), ["99999 אגורות = 999 ₪ ו־99 אג׳"]));

test("בלי שברים: Math.floor ו־%", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /Math\.floor\(/, "את השקלים — עם Math.floor");
  assert.match(src, /%/, "את האגורות — עם %");
});
