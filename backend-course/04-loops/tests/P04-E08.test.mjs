import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E08.js";

test("סכום וממוצע", () => sameOutput(run(import.meta.url, FILE), ["סכום 1..100: 5050", "ממוצע הזוגיים: 51"]));

test("התוצאות מחושבות בלולאה, לא כתובות", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /for\s*\(|while\s*\(/, "חשב עם לולאה");
  assert.ok(!/\b5050\b|\b51\b/.test(src), "5050 או 51 כתובים בקוד — הם צריכים להיות מחושבים");
});
