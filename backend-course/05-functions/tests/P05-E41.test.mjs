import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E41.js";
const get = () => exportsOf(import.meta.url, FILE, ["gradeText"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("כל הדרגות", async () => {
  const { gradeText } = await get();
  assert.equal(gradeText(95), "מצוין");
  assert.equal(gradeText(82), "טוב מאוד");
  assert.equal(gradeText(70), "טוב");
  assert.equal(gradeText(60), "עובר");
  assert.equal(gradeText(30), "נכשל");
});
test("על הגבולות", async () => {
  const { gradeText } = await get();
  for (const [s, t] of [[100, "מצוין"], [90, "מצוין"], [89, "טוב מאוד"], [80, "טוב מאוד"], [65, "טוב"], [55, "עובר"], [54, "נכשל"], [0, "נכשל"]]) {
    assert.equal(gradeText(s), t, `gradeText(${s})`);
  }
});
test("מחוץ לטווח", async () => {
  const { gradeText } = await get();
  assert.equal(gradeText(-1), "ציון לא חוקי");
  assert.equal(gradeText(101), "ציון לא חוקי");
});
