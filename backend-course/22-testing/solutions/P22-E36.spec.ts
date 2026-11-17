// P22-E36 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseListQuery } from "./P22-E36.ts";

test("ברירות מחדל", () => {
  assert.deepEqual(parseListQuery(""), { page: 1, limit: 20 });
});

test("כל השדות", () => {
  assert.deepEqual(parseListQuery("?page=3&limit=50&status=done&q=%20חלב%20"), { page: 3, limit: 50, status: "done", q: "חלב" });
  assert.deepEqual(parseListQuery("?status=todo&limit=1"), { page: 1, limit: 1, status: "todo" });
});

test("q ריק לא נכנס", () => {
  assert.deepEqual(parseListQuery("?q=%20%20"), { page: 1, limit: 20 });
});

test("ערכים לא תקינים ← RangeError", () => {
  for (const q of ["?page=0", "?page=-1", "?page=1.5", "?page=2abc", "?limit=0", "?limit=51", "?status=urgent", "?status="]) {
    assert.throws(() => parseListQuery(q), RangeError, q);
  }
});
