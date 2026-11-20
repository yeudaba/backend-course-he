import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, bareCode } from "./_out.mjs";

const FILE = "P04-E81.js";
const withN = (n) => run(import.meta.url, FILE, { changes: [[/(\bn\s*=\s*)91\b/, `$1${n}`, "את השורה const n = 91;"]] });
const line = (n, d) => [`המחלק הקטן ביותר של ${n}: ${d}`];

test("91 ← 7", () => sameOutput(run(import.meta.url, FILE), line(91, 7)));
test("97 (ראשוני) ← 97", () => sameOutput(withN(97), line(97, 97)));
test("100 ← 2", () => sameOutput(withN(100), line(100, 2)));
test("49 ← 7", () => sameOutput(withN(49), line(49, 7)));
test("2 ← 2", () => sameOutput(withN(2), line(2, 2)));
test("עוצרים עם break", () => {
  assert.match(bareCode(source(import.meta.url, FILE)), /\bbreak\b/, "עצור את הלולאה עם break ברגע שמצאת מחלק");
});
