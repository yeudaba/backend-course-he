import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E20-infinite.js";

let firstOk = false;

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["5", "4", "3", "2", "1", "🚀 המראה!"]);
  firstOk = true;
});

test("עובד גם כשמתחילים מ־3", (t) => {
  if (!firstOk) return t.skip("קודם תקן את הבדיקה הראשונה");
  sameOutput(run(import.meta.url, FILE, { changes: [[/seconds = 5/, "seconds = 3", "את השורה let seconds = 5"]] }), ["3", "2", "1", "🚀 המראה!"]);
});
