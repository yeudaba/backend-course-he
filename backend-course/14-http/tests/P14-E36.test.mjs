import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E36.mjs", ["withQuery"])).withQuery;

test("קובע ומחליף, שומר על הסדר", async () => {
  const f = await get();
  assert.equal(f("http://shop.test/p?page=1&sort=price", { page: 2 }), "http://shop.test/p?page=2&sort=price");
  assert.equal(f("http://shop.test/p?a=1", { b: "x", c: 3 }), "http://shop.test/p?a=1&b=x&c=3");
  assert.equal(f("http://shop.test/p", { inStock: false, min: 0 }), "http://shop.test/p?inStock=false&min=0", "0 ו־false הם ערכים — לא מוחקים אותם");
  assert.equal(f("http://shop.test/p", { q: "" }), "http://shop.test/p?q=", "מחרוזת ריקה היא ערך");
});
test("null ו־undefined מוחקים", async () => {
  const f = await get();
  assert.equal(f("http://shop.test/p?page=1&sort=price", { sort: null }), "http://shop.test/p?page=1");
  assert.equal(f("http://shop.test/p?page=1", { page: undefined }), "http://shop.test/p");
  assert.equal(f("http://shop.test/p?page=1", { page: null, q: "red shoes" }), "http://shop.test/p?q=red+shoes");
  assert.equal(f("http://shop.test/p?x=1", { nothing: null }), "http://shop.test/p?x=1");
});
test("קידוד", async () => {
  const f = await get();
  assert.equal(f("http://shop.test/p", { q: "מסך" }), "http://shop.test/p?q=%D7%9E%D7%A1%D7%9A");
  assert.equal(f("http://shop.test/p", { q: "a&b=c" }), "http://shop.test/p?q=a%26b%3Dc", "תווים מיוחדים בערך חייבים קידוד");
});
