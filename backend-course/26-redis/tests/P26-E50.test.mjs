import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { cacheKey } = await load(import.meta.url, "P26-E50.ts");

test("הדוגמה מהמשימה", () => {
  assert.equal(cacheKey("products", { q: " V60 ", page: 1, tags: ["b", "a"], sort: undefined }), 'products:{"page":1,"q":"V60","tags":["a","b"]}');
});
test("סדר המפתחות לא משנה", () => {
  const a = cacheKey("p", { z: 1, a: "x", m: true });
  const b = cacheKey("p", { m: true, z: 1, a: "x" });
  assert.equal(a, b);
  assert.equal(a, 'p:{"a":"x","m":true,"z":1}');
});
test("ערכים ריקים לא נכנסים — אבל 0 ו־false כן", () => {
  assert.equal(cacheKey("g", { a: null, b: undefined, c: "  ", d: [], e: 0, f: false, h: "" }), 'g:{"e":0,"f":false}');
  assert.equal(cacheKey("empty", {}), "empty:{}");
});
test("מערך — עותק ממוין; המקור לא משתנה", () => {
  const tags = ["mocha", "latte", "espresso"];
  assert.equal(cacheKey("t", { tags }), 't:{"tags":["espresso","latte","mocha"]}');
  assert.deepEqual(tags, ["mocha", "latte", "espresso"], "המערך של הקורא נשאר כמו שהיה");
});
