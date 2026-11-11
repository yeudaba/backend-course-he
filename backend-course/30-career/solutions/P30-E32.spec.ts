// P30-E32 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidIsraeliId } from "./P30-E32.ts";

test("מספרים תקינים", () => {
  for (const id of ["123456782", "039337423", "999999998", "200000008"]) assert.equal(isValidIsraeliId(id), true, id);
});

test("ספרת ביקורת לא נכונה", () => {
  for (const id of ["123456789", "123456783", "039337424", "301122334"]) assert.equal(isValidIsraeliId(id), false, id);
});

test("פחות מ־9 ספרות — משלימים באפסים משמאל", () => {
  assert.equal(isValidIsraeliId("18"), true, "18 ← 000000018");
  assert.equal(isValidIsraeliId("000000018"), true);
  assert.equal(isValidIsraeliId("81"), false);
});

test("רווחים מסביב מותרים", () => {
  assert.equal(isValidIsraeliId("  123456782 "), true);
});

test("קלט לא תקין ← false", () => {
  for (const id of ["", "   ", "12345678a", "1234567820", "0", "000000000", "1 9", "-18", "12.3"]) assert.equal(isValidIsraeliId(id), false, JSON.stringify(id));
});
