import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createTtlLru } = await load(import.meta.url, "P27-E55.ts");

test("LRU", () => {
  let t = 0;
  const c = createTtlLru(2, 1000, () => t);
  c.set("a", 1); c.set("b", 2);
  assert.equal(c.get("a"), 1);
  c.set("c", 3);
  assert.equal(c.get("b"), undefined, "b — הכי מזמן");
  assert.equal(c.get("a"), 1);
  assert.equal(c.size(), 2);
  c.set("a", 10);
  c.set("d", 4);
  assert.equal(c.get("c"), undefined);
  assert.equal(c.get("a"), 10);
});
test("TTL", () => {
  let t = 0;
  const c = createTtlLru(3, 1000, () => t);
  c.set("a", 1);
  t = 500; c.set("b", 2);
  t = 999; assert.equal(c.get("a"), 1);
  t = 1000; assert.equal(c.get("a"), undefined, "פג בדיוק ב־expiresAt");
  assert.equal(c.size(), 1);
  t = 1400; c.set("b", 22);
  t = 2000; assert.equal(c.get("b"), 22, "set חידש את התוקף");
  t = 2400; assert.equal(c.get("b"), undefined);
  assert.equal(c.size(), 0);
  c.set("x", 0);
  assert.equal(c.get("x"), 0, "0 הוא ערך");
});
test("ברירת מחדל Date.now", async () => {
  const c = createTtlLru(5, 30);
  c.set("k", "v");
  assert.equal(c.get("k"), "v");
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(c.get("k"), undefined);
});
