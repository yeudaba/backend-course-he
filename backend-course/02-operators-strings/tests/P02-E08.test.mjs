import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E08.js";

test("הכרטיס זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מזל טוב, עומר!", "היום אתה בן 30.", "בשנה הבאה תהיה בן 31.", "ברכות חמות מכל החברים ב־אילת."]);
});

test("עם שם, גיל ועיר אחרים — הכרטיס מתעדכן והגיל הבא מחושב", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(["'`])עומר\1/, '"דני"', 'את "עומר"'],
      [/(age\s*=\s*)30\b/, "$144", "את const age = 30"],
      [/(["'`])אילת\1/, '"חיפה"', 'את "אילת"'],
    ],
  });
  sameOutput(r, ["מזל טוב, דני!", "היום אתה בן 44.", "בשנה הבאה תהיה בן 45.", "ברכות חמות מכל החברים ב־חיפה."]);
});

test("הדפסה אחת של template literal אחד", () => {
  const src = code(source(import.meta.url, FILE));
  const logs = src.match(/console\.log\(/g)?.length ?? 0;
  assert.equal(logs, 1, `מצאנו ${logs} קריאות ל־console.log — המשימה: template literal אחד על כמה שורות`);
  assert.match(src, /`[\s\S]*\n[\s\S]*`/, "ה־template literal צריך להתפרס על כמה שורות");
});
