import { test } from "node:test";
import assert from "node:assert/strict";
import { run, printed, source, code } from "./_out.mjs";

const FILE = "P04-E16.js";

// שתי השורות הראשונות — מהפתרון החשבוני. שורה נוספת (הפתרון עם מחרוזת) לא נבדקת
function check(r, sum, count) {
  printed(r);
  assert.equal(r.lines[0], `סכום ספרות: ${sum}`);
  assert.equal(r.lines[1], `מספר ספרות: ${count}`);
}

test("90517", () => check(run(import.meta.url, FILE), 22, 5));
test("1000 — אפסים באמצע", () => check(run(import.meta.url, FILE, { changes: [[/=\s*90517\b/, "= 1000", "את המספר 90517"]] }), 1, 4));
test("7 — ספרה אחת", () => check(run(import.meta.url, FILE, { changes: [[/=\s*90517\b/, "= 7", "את המספר 90517"]] }), 7, 1));

test("הפתרון הראשון עם % ו־Math.floor", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /%\s*10/, "הספרה האחרונה: n % 10");
  assert.match(src, /Math\.floor\(/, "להוריד ספרה: Math.floor(n / 10)");
});
