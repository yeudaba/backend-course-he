// P25.7-E27 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSort } from "./P25.7-E27.ts";

const ALLOWED = ["name", "price", "createdAt", "_id"];

// deepEqual לא בודק את סדר המפתחות — ובמיון של Mongo הסדר הוא כל העניין
function sameSort(actual: Record<string, number>, expected: Record<string, number>) {
  assert.deepEqual(Object.entries(actual), Object.entries(expected));
}

test("עולה, יורד, וכמה שדות לפי הסדר", () => {
  sameSort(parseSort("name", ALLOWED), { name: 1, _id: 1 });
  sameSort(parseSort("-price", ALLOWED), { price: -1, _id: 1 });
  sameSort(parseSort("-price,name", ALLOWED), { price: -1, name: 1, _id: 1 });
  sameSort(parseSort("name,-price", ALLOWED), { name: 1, price: -1, _id: 1 });
});

test("רווחים", () => {
  sameSort(parseSort(" -price , name ", ALLOWED), { price: -1, name: 1, _id: 1 });
});

test("_id: לא מוסיפים פעמיים, ולא משנים את הכיוון שנבחר", () => {
  sameSort(parseSort("-_id", ALLOWED), { _id: -1 });
  sameSort(parseSort("_id,name", ALLOWED), { _id: 1, name: 1 });
});

test("בלי value, או value ריק ← { _id: 1 }", () => {
  sameSort(parseSort(undefined, ALLOWED), { _id: 1 });
  sameSort(parseSort("", ALLOWED), { _id: 1 });
  sameSort(parseSort("   ", ALLOWED), { _id: 1 });
});

test("שדה לא מותר, ריק או כפול ← RangeError", () => {
  for (const bad of ["password", "-password", "name,secret", "price,", "-", "name,-name", "price,price"]) {
    assert.throws(() => parseSort(bad, ALLOWED), RangeError, bad);
  }
});
