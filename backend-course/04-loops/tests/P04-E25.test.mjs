import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, printed } from "./_out.mjs";

const FILE = "P04-E25.js";
const withPayment = (p) => run(import.meta.url, FILE, { changes: [[/(monthlyPayment\s*=\s*)1500\b/, `$1${p}`, "את השורה const monthlyPayment = 1500;"]] });

test("הלוח מהתרגיל", () => {
  sameOutput(run(import.meta.url, FILE), [
    "חודש  ריבית  תשלום   יתרה",
    "1     100.00 1500.00 8600.00",
    "2     86.00  1500.00 7186.00",
    "3     71.86  1500.00 5757.86",
    "4     57.58  1500.00 4315.44",
    "5     43.15  1500.00 2858.59",
    "6     28.59  1500.00 1387.18",
    "7     13.87  1401.05 0.00",
    "---",
    "סה״כ שולם: 10401.05",
    "סה״כ ריבית: 401.05",
  ]);
});

test("תשלום של 5000 — שלושה חודשים", () => {
  sameOutput(withPayment(5000), ["חודש  ריבית  תשלום   יתרה", "1     100.00 5000.00 5100.00", "2     51.00  5000.00 151.00", "3     1.51   152.51  0.00", "---", "סה״כ שולם: 10152.51", "סה״כ ריבית: 152.51"]);
});

test("תשלום של 100 לא מכסה את הריבית — הודעה, בלי לולאה אינסופית", () => {
  const r = withPayment(100);
  printed(r);
  assert.equal(r.lines.length, 1, "ציפינו להודעה אחת בלבד, בלי טבלה");
  assert.ok(!r.lines[0].startsWith("חודש"), "לא מדפיסים את כותרת הטבלה כשההלוואה לא תיגמר לעולם");
});
