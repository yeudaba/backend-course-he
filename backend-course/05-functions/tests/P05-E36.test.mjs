import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E36.js";
const get = () => exportsOf(import.meta.url, FILE, ["toAgorot","agorotToText"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("toAgorot", async () => {
  const { toAgorot } = await get();
  assert.equal(toAgorot(19.99), 1999);
  assert.equal(toAgorot(12), 1200);
  assert.equal(toAgorot(0.29), 29, "0.29 * 100 הוא 28.999999999999996 — צריך לעגל לשלם הקרוב");
  assert.equal(toAgorot(1.15), 115, "1.15 * 100 הוא 114.99999999999999");
});
test("agorotToText", async () => {
  const { agorotToText } = await get();
  assert.equal(agorotToText(1234), "12.34 ₪");
  assert.equal(agorotToText(5), "0.05 ₪");
  assert.equal(agorotToText(1230), "12.30 ₪");
  assert.equal(agorotToText(100), "1.00 ₪");
  assert.equal(agorotToText(0), "0.00 ₪");
});
