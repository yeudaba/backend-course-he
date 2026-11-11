import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E22-accumulators.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["סכום: -22", "הכי חם: -1", "הכי קר: -6"]);
});

test("עובד גם עם טמפרטורות חיוביות", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [['"-2,-1,-6,-3,-4,-1,-5"', '"12,17,15"', "את מחרוזת הטמפרטורות"]] }), ["סכום: 44", "הכי חם: 17", "הכי קר: 12"]);
});

test("עובד גם עם טמפרטורה אחת", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [['"-2,-1,-6,-3,-4,-1,-5"', '"-8"', "את מחרוזת הטמפרטורות"]] }), ["סכום: -8", "הכי חם: -8", "הכי קר: -8"]);
});
