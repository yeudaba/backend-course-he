import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E81.js";
const withTotal = (n) => run(import.meta.url, FILE, { changes: [[/total\s*=\s*250/, `total = ${n}`, "את השורה const total = 250"]] });

test("250 ← משלוח חינם, בלי שורת 'עוד'", () => {
  sameOutput(run(import.meta.url, FILE), ["סכום: 250", "דמי משלוח: 0"]);
});

test("200 בדיוק ← חינם (200 ומעלה)", () => {
  sameOutput(withTotal(200), ["סכום: 200", "דמי משלוח: 0"]);
});

test("150 ← 15, ועוד 50 למשלוח חינם", () => {
  sameOutput(withTotal(150), ["סכום: 150", "דמי משלוח: 15", "עוד 50 ש״ח למשלוח חינם"]);
});

test("100 בדיוק ← 15", () => {
  sameOutput(withTotal(100), ["סכום: 100", "דמי משלוח: 15", "עוד 100 ש״ח למשלוח חינם"]);
});

test("99 ← 30", () => {
  sameOutput(withTotal(99), ["סכום: 99", "דמי משלוח: 30", "עוד 101 ש״ח למשלוח חינם"]);
});
