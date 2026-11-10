import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E18.js";
const withInput = (v) => run(import.meta.url, FILE, { changes: [[/(weightInput\s*=\s*)(["'`]).*?\2/, `$1"${v}"`, "את const weightInput = ..."]] });

test("72.5 ק״ג", () => {
  sameOutput(run(import.meta.url, FILE), ["72.5 ק״ג = 159.83 פאונד", "בדיקת קלט: 72.5 הוא מספר? true"]);
});

test("100 ק״ג", () => {
  sameOutput(withInput("100"), ["100 ק״ג = 220.46 פאונד", "בדיקת קלט: 100 הוא מספר? true"]);
});

test('"72,5" עם פסיק ← NaN, והבדיקה אומרת false', () => {
  sameOutput(withInput("72,5"), ["NaN ק״ג = NaN פאונד", "בדיקת קלט: 72,5 הוא מספר? false"]);
});
