import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E35.js";
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["בשקלים: 0.30000000000000004", "באגורות: 30"]);
});

test("התוצאות לא כתובות בקוד", () => {
  const src = bare(source(import.meta.url, FILE));
  assert.ok(!/0\.3/.test(src), "0.3... כתוב בקוד — תן ל־JavaScript לחשב את 0.1 + 0.2");
  assert.ok(!/(^|[^\d.])30(?![\d.])/.test(src), "30 כתוב בקוד — תן ל־JavaScript לחשב את 10 + 20");
});

test("עם מספרים אחרים (0.1 + 0.4, 10 + 40) החשבון משתנה", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(\+\s*)0\.2\b/, "$10.4", "את החשבון 0.1 + 0.2"],
      [/(\+\s*)20\b/, "$140", "את החשבון 10 + 20"],
    ],
  });
  sameOutput(r, ["בשקלים: 0.5", "באגורות: 50"]);
});
