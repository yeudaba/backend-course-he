import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E27.js";
const withPhone = (p) => run(import.meta.url, FILE, { changes: [[/(phoneInput\s*=\s*)(["'`]).*?\2/, `$1"${p}"`, "את השורה const phoneInput = ...;"]] });

test("המספר מהתרגיל, עם מקף ורווח", () => {
  sameOutput(run(import.meta.url, FILE), ["נקי: 0541234567", "לתצוגה: 054-1234567", "מוסתר: 054-***4567"]);
});

test("מספר בלי מקפים ורווחים", () => {
  sameOutput(withPhone("0521112222"), ["נקי: 0521112222", "לתצוגה: 052-1112222", "מוסתר: 052-***2222"]);
});

test("9 ספרות ← לא תקין", () => sameOutput(withPhone(" 03-1234567"), ["מספר לא תקין: 03-1234567"]));
test("10 ספרות שלא מתחילות ב־05 ← לא תקין", () => sameOutput(withPhone("077 777 7777"), ["מספר לא תקין: 077 777 7777"]));
