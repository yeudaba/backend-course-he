import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P01-E58.js";

test("הפלט זהה לפלט הרצוי (בלי NaN)", () => {
  sameOutput(run(import.meta.url, FILE), ["מחיר: 100", "הנחה: 0", "לתשלום: 100"]);
});

test("מחיר 250 — לתשלום 250", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [[/(price\s*=\s*)100\b/, "$1250", "את const price = 100"]] }), ["מחיר: 250", "הנחה: 0", "לתשלום: 250"]);
});

test("הנחה 30 — לתשלום 70 (כלומר discount באמת נכנס לחשבון)", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [[/(discount\s*=\s*)0\b/, "$130", "את discount = 0"]] }), ["מחיר: 100", "הנחה: 30", "לתשלום: 70"]);
});
