import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, bareCode } from "./_out.mjs";

const FILE = "P02-E83.js";
const bare = () => bareCode(source(import.meta.url, FILE));
const withPrice = (n) => run(import.meta.url, FILE, { changes: [[/(price\s*=\s*)240\b/, `$1${n}`, "את השורה const price = 240;"]] });
const lines = (price, discount, toPay) => [`מחיר: ${price}`, `הנחה: ${discount}`, `לתשלום: ${toPay}`];

test("מחיר 240 — 15% הנחה", () => sameOutput(run(import.meta.url, FILE), lines(240, 36, 204)));
test("מחיר 1000 — ההנחה נעצרת ב־50", () => sameOutput(withPrice(1000), lines(1000, 50, 950)));
test("מחיר 20 — הנחה קטנה, בלי תקרה", () => sameOutput(withPrice(20), lines(20, 3, 17)));
test("מחיר 400 — 15% הם 60, ולכן 50", () => sameOutput(withPrice(400), lines(400, 50, 350)));
test("התוצאות מחושבות", () => {
  for (const n of [36, 204]) assert.ok(!new RegExp(`(?<![\\d.])${n}(?![\\d.])`).test(bare()), `המספר ${n} כתוב בקוד שלך — הוא צריך להיות מחושב מ־price`);
});
