import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const money = () => exportsOf(import.meta.url, "P08-E26-money.mjs", ["toAgorot", "formatILS"], "export");
const main = () => exportsOf(import.meta.url, "P08-E26.mjs", ["cartTotal"], "export");

test("toAgorot — מספר שלם", async () => {
  const { toAgorot } = await money();
  assert.equal(toAgorot(19.9), 1990, "19.9 * 100 הוא 1989.9999999999998 — צריך לעגל");
  assert.equal(toAgorot(0.1), 10);
  assert.equal(toAgorot(25), 2500);
});
test("formatILS", async () => {
  const { formatILS } = await money();
  assert.equal(formatILS(2500), "₪25.00");
  assert.equal(formatILS(5), "₪0.05");
  assert.equal(formatILS(0), "₪0.00");
});
test("cartTotal", async () => {
  const { cartTotal } = await main();
  assert.equal(cartTotal([19.9, 0.1, 5]), "₪25.00");
  assert.equal(cartTotal([0.1, 0.2]), "₪0.30");
  assert.equal(cartTotal([]), "₪0.00", "עגלה ריקה (ערך התחלתי ל־reduce?)");
});
test("cartTotal מייבאת מהמודול ולא מעתיקה את הקוד", () => {
  const src = code(import.meta.url, "P08-E26.mjs");
  assert.match(src, /import\s*\{[^}]*\}\s*from\s*["']\.\/P08-E26-money\.mjs["']/, 'חסר import { ... } from "./P08-E26-money.mjs"');
  assert.doesNotMatch(src, /function\s+(toAgorot|formatILS)\b|(toAgorot|formatILS)\s*=/, "אל תגדיר את toAgorot או formatILS שוב — ייבא אותן");
});
