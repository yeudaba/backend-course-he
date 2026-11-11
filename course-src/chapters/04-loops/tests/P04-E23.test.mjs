import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E23-nested.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["A1 A2 A3 A4 A5", "B1 B2 B3 B4 B5", "C1 C2 C3 C4 C5", "סה״כ כיסאות: 15"]);
});

test("עובד גם עם אולם בגודל אחר", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      ['"ABC"', '"ABCD"', 'את השורות "ABC"'],
      [/seatsPerRow = 5/, "seatsPerRow = 2", "את השורה seatsPerRow = 5"],
    ],
  });
  sameOutput(r, ["A1 A2", "B1 B2", "C1 C2", "D1 D2", "סה״כ כיסאות: 8"]);
});
