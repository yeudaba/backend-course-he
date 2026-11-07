import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { formatNumber, addCommas } = await load(import.meta.url, "P05-E25.js");

test("addCommas", () => {
  assert.equal(addCommas("1234567"), "1,234,567");
  assert.equal(addCommas("123"), "123");
  assert.equal(addCommas("1000"), "1,000");
});
test("formatNumber — דוגמאות", () => {
  assert.equal(formatNumber(1234567.891), "1,234,567.89");
  assert.equal(formatNumber(999), "999.00");
  assert.equal(formatNumber(1000000, 0), "1,000,000");
});
test("formatNumber — שלילי", () => assert.equal(formatNumber(-1234.5, 1), "-1,234.5"));
test("formatNumber — קטן מאלף ואפס", () => { assert.equal(formatNumber(0), "0.00"); assert.equal(formatNumber(12.345, 1), "12.3"); });
