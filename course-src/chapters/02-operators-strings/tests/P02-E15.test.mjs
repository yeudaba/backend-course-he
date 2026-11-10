import { test } from "node:test";
import assert from "node:assert/strict";
import { run, printed } from "./_out.mjs";

const FILE = "P02-E15.js";

function check(r, last4, digits) {
  printed(r);
  assert.equal(r.lines[0], `**** **** **** ${last4}`);
  assert.equal(r.lines[1], `כרטיס שמסתיים ב־${last4} (${digits} ספרות)`);
  // הבונוס לא חובה — אבל אם הדפסת אותו, הוא צריך להיות נכון
  if (r.lines.length > 2) assert.equal(r.lines[2], last4.padStart(digits, "*"), "שורת הבונוס: כוכבית לכל ספרה, חוץ מ־4 האחרונות");
}

test("כרטיס של 16 ספרות", () => check(run(import.meta.url, FILE), "5678", 16));

test("כרטיס של 15 ספרות (ארבע אחרונות — לא slice(12))", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(cardNumber\s*=\s*)(["'`])\d+\2/, '$1"371449635398431"', "את const cardNumber = ..."]] });
  check(r, "8431", 15);
});
