import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { isLeapYear, daysInMonth } = await load(import.meta.url, "P05-E15.js");

test("isLeapYear", () => {
  assert.equal(isLeapYear(2024), true);
  assert.equal(isLeapYear(2023), false);
  assert.equal(isLeapYear(1900), false);
  assert.equal(isLeapYear(2000), true);
});
test("daysInMonth", () => {
  assert.equal(daysInMonth(1, 2025), 31);
  assert.equal(daysInMonth(4, 2025), 30);
  assert.equal(daysInMonth(2, 2024), 29);
  assert.equal(daysInMonth(2, 2100), 28);
  assert.equal(daysInMonth(12, 2025), 31);
});
test("חודש לא חוקי → null", () => { assert.equal(daysInMonth(0, 2025), null); assert.equal(daysInMonth(13, 2025), null); });
