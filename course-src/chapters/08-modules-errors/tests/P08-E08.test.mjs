import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parsePositiveInt } = await load(import.meta.url, "P08-E08.js");

test("ערכים תקינים", () => { assert.equal(parsePositiveInt("3"), 3); assert.equal(parsePositiveInt(" 12 ", "כמות"), 12); });
test("ריק", () => assert.throws(() => parsePositiveInt("  ", "כמות"), { message: "כמות: שדה חובה" }));
test("לא מספר", () => assert.throws(() => parsePositiveInt("abc", "כמות"), { message: "כמות: חייב להיות מספר" }));
test("לא שלם / לא חיובי", () => {
  assert.throws(() => parsePositiveInt("2.5", "כמות"), { message: "כמות: חייב להיות מספר שלם חיובי" });
  assert.throws(() => parsePositiveInt("0"), { message: "ערך: חייב להיות מספר שלם חיובי" });
});
test("זורקת Error אמיתי", () => assert.throws(() => parsePositiveInt(""), Error));
