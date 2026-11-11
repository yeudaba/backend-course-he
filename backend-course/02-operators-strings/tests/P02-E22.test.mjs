import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E22-price-bugs.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מחיר מקורי: 120.00", "הנחה (15%): 18.00", "אחרי הנחה: 102.00", "כולל משלוח: 122.00"]);
});

test("עובד גם עם מחיר אחר", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [['"120"', '"80"', 'את המחיר "120"']] }), ["מחיר מקורי: 80.00", "הנחה (15%): 12.00", "אחרי הנחה: 68.00", "כולל משלוח: 88.00"]);
});

test("toFixed רק בהדפסה", () => {
  const bad = code(source(import.meta.url, FILE)).split("\n").filter((l) => l.includes("toFixed") && !l.includes("console.log"));
  assert.deepEqual(bad, [], "יש toFixed מחוץ ל־console.log — toFixed מחזיר טקסט, אז משתמשים בו רק כשמדפיסים");
});
