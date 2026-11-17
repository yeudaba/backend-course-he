import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E43.mjs", ["pageLinks"])).pageLinks;

test("עמוד באמצע — שני קישורים, שאר הפרמטרים נשמרים", async () => {
  const f = await get();
  assert.deepEqual(f("http://shop.test/products?q=mouse&page=2&limit=5", 12), {
    page: 2,
    limit: 5,
    pages: 3,
    prev: "http://shop.test/products?q=mouse&page=1&limit=5",
    next: "http://shop.test/products?q=mouse&page=3&limit=5",
  });
});
test("ברירות מחדל וקצוות", async () => {
  const f = await get();
  assert.deepEqual(f("http://shop.test/products", 0), { page: 1, limit: 10, pages: 1, prev: null, next: null }, "רשימה ריקה ← עמוד אחד");
  assert.deepEqual(f("http://shop.test/products", 25), { page: 1, limit: 10, pages: 3, prev: null, next: "http://shop.test/products?page=2" });
  const last = f("http://shop.test/p?page=3", 30);
  assert.equal(last.pages, 3);
  assert.equal(last.next, null, "בעמוד האחרון אין next");
  assert.equal(last.prev, "http://shop.test/p?page=2");
  const beyond = f("http://shop.test/p?page=9", 30);
  assert.equal(beyond.page, 9);
  assert.equal(beyond.next, null);
  assert.equal(beyond.prev, "http://shop.test/p?page=8");
});
test("ערכים לא תקינים ב־query", async () => {
  const f = await get();
  const r = f("http://shop.test/p?page=-3&limit=abc", 25);
  assert.equal(r.page, 1, "page שלילי ← 1");
  assert.equal(r.limit, 10, "limit שאינו מספר ← 10");
  assert.equal(f("http://shop.test/p?limit=0", 5).limit, 10, "limit=0 ← 10");
  assert.equal(f("http://shop.test/p?limit=2.5", 5).limit, 10, "limit לא שלם ← 10");
  assert.equal(f("http://shop.test/p?page=", 5).page, 1, "page ריק ← 1");
  const big = f("http://shop.test/p?limit=5000", 250);
  assert.equal(big.limit, 100, "limit מעל 100 ← 100");
  assert.equal(big.pages, 3);
});
