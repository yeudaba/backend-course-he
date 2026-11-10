import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E09.js";

test("כמות 22, סכום 543", () => sameOutput(run(import.meta.url, FILE), ["כמות: 22", "סכום: 543"]));

test("התוצאות מחושבות בלולאה, לא כתובות", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /for\s*\(|while\s*\(/, "חשב עם לולאה");
  assert.ok(!/\b543\b|\b22\b/.test(src), "543 או 22 כתובים בקוד — הם צריכים להיות מחושבים");
});
