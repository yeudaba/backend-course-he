import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E86.js";
const get = () => exportsOf(import.meta.url, FILE, ["parsePrice"]);

test("מחירים תקינים ← אגורות", async () => {
  const { parsePrice } = await get();
  const cases = [
    ["12", 1200],
    ["12.5", 1250],
    ["12.50", 1250],
    ["12.05", 1205],
    ["0.99", 99],
    ["0", 0],
    ["1234", 123400],
    ["1,234", 123400],
    ["1,234.50", 123450],
    ["12,345,678.9", 1234567890],
    ["₪12", 1200],
    ["₪ 12.3", 1230],
    [" ₪ 1,234.50 ", 123450],
    ["  7  ", 700],
  ];
  for (const [text, agorot] of cases) {
    assert.equal(parsePrice(text), agorot, `parsePrice("${text}")`);
  }
});
test("התוצאה מספר שלם (בלי שגיאת עשרוניים)", async () => {
  const { parsePrice } = await get();
  for (const text of ["0.29", "0.57", "1.15", "4.35", "1,005.07"]) {
    assert.ok(Number.isInteger(parsePrice(text)), `parsePrice("${text}") החזיר ${parsePrice(text)} — לא מספר שלם`);
  }
  assert.equal(parsePrice("0.29"), 29);
  assert.equal(parsePrice("4.35"), 435);
});
test("קלט לא תקין ← Error עם הטקסט בהודעה", async () => {
  const { parsePrice } = await get();
  for (const text of ["12,50", "12.345", "-5", "abc", "", "12.", ".5", "1,23", "1,2345", "12 50", "12₪", "₪₪12", "1.2.3"]) {
    assert.throws(() => parsePrice(text), (err) => err instanceof Error && err.message === `מחיר לא תקין: "${text}"`, `parsePrice("${text}") צריך לזרוק Error עם ההודעה: מחיר לא תקין: "${text}"`);
  }
});
