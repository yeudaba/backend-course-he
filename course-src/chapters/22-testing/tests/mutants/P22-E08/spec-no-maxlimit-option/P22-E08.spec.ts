// P22-E08 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePagination } from "./P22-E08.ts";

test("ברירות מחדל", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, offset: 0 });
  assert.deepEqual(parsePagination({}, { defaultLimit: 5 }), { page: 1, limit: 5, offset: 0 });
});

test("offset", () => {
  assert.deepEqual(parsePagination({ page: "3", limit: "10" }), { page: 3, limit: 10, offset: 20 });
});

test("הגבולות עצמם תקינים", () => {
  assert.equal(parsePagination({ limit: "50" }).limit, 50);
  assert.equal(parsePagination({ limit: "1" }).limit, 1);
});

test("ערכים לא תקינים ← RangeError", () => {
  for (const query of [{ page: "0" }, { page: "-1" }, { page: "abc" }, { page: "" }, { limit: "51" }, { limit: "0" }, { limit: "2.5" }]) {
    assert.throws(() => parsePagination(query), RangeError, JSON.stringify(query));
  }
});

test("ההודעה מציינת את הערך", () => {
  assert.throws(() => parsePagination({ limit: "99" }), { message: "limit לא תקין: 99" });
});
