import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25-E90.ts", ["waitingLine", "notReadyLine", "successLine", "failLine"]);

test("הדוגמאות", async () => {
  const { waitingLine, notReadyLine, successLine, failLine } = await get();
  assert.equal(waitingLine(1, { status: 200, commit: "2cb197caebad857c" }, "9f0e1d2c3b4a"), "#1: /version ← 200, commit 2cb197c (מחכים ל־9f0e1d2)");
  assert.equal(waitingLine(4, { status: 0, error: "ECONNREFUSED" }, null), "#4: /version ← ECONNREFUSED");
  assert.equal(notReadyLine(5, 503), "#5: הגרסה החדשה רצה, אבל /ready ← 503");
  assert.equal(successLine("https://api.x.com", "2cb197caebad857c", 61.4), "✔ https://api.x.com — commit 2cb197c, ready (61s)");
  assert.equal(failLine("9f0e1d2c3b4a", 900), "✖ הגרסה 9f0e1d2 לא עלתה תוך 900 שניות");
});
test("עוד מקרים", async () => {
  const { waitingLine, successLine, failLine } = await get();
  assert.equal(waitingLine(2, { status: 503 }, "abcdef1234"), "#2: /version ← 503", "בלי commit — בלי '(מחכים')");
  assert.equal(waitingLine(3, { status: 200, commit: "abcdef1234567" }, null), "#3: /version ← 200, commit abcdef1");
  assert.equal(waitingLine(9, { status: 0, error: "TimeoutError", commit: undefined }, "x"), "#9: /version ← TimeoutError");
  assert.equal(successLine("http://localhost:3925", "2cb197c", 0.4), "✔ http://localhost:3925 — commit 2cb197c, ready (0s)");
  assert.equal(failLine(null, 3), "✖ הגרסה לא עלתה תוך 3 שניות");
});
