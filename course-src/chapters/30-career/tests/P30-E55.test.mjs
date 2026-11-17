import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { personalInfo } = await load(import.meta.url, "P30-E55.ts");

test("כל הסוגים, בסדר קבוע", () => {
  const cv = "![me](photo.jpg)\n# Dan Levi\nAge: 29 · Married · ID 012345678\nDate of birth: 1.1.1997";
  assert.deepEqual(personalInfo(cv), ["age", "birth", "marital", "id", "photo"]);
  assert.deepEqual(personalInfo("גיל 31, נשואה + 2. ת״ז: 123456782"), ["age", "marital", "id"]);
  assert.deepEqual(personalInfo("I am 24 years old and single"), ["age", "marital"]);
  assert.deepEqual(personalInfo("born in Haifa; DOB 03/1999"), ["birth"]);
  assert.deepEqual(personalInfo('ת"ז 12345 · רווק'), ["marital", "id"]);
});
test("בלי התראות שווא", () => {
  assert.deepEqual(personalInfo("Built 3 APIs with 22 endpoints; managed a page of 10 items. Image processing pipeline."), []);
  assert.deepEqual(personalInfo("Stored user IDs in Redis (12345678 keys)"), [], "‏IDs אינו ID");
  assert.deepEqual(personalInfo("Package: 2025 · usage 99"), []);
  assert.deepEqual(personalInfo("[link](https://x.y)"), [], "קישור אינו תמונה");
});
