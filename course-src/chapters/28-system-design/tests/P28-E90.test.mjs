import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { FeedStore } = await load(import.meta.url, "P28-E90.ts");

test("מהחדש, תקרה, בלי כפילויות", () => {
  const f = new FeedStore(3);
  for (const id of [1, 2, 3, 2, 4]) f.add("dana", id);
  assert.deepEqual(f.read("dana"), [4, 3, 2]);
  assert.equal(f.size("dana"), 3);
  assert.deepEqual(f.read("nobody"), []);
  assert.equal(f.size("nobody"), 0);
});
test("עמודים עם before", () => {
  const f = new FeedStore();
  for (let i = 1; i <= 50; i++) f.add("u", i);
  assert.deepEqual(f.read("u", 3), [50, 49, 48]);
  assert.deepEqual(f.read("u", 3, 48), [47, 46, 45]);
  assert.deepEqual(f.read("u", 5, 2), [1]);
  assert.deepEqual(f.read("u", 5, 999), []);
  assert.equal(f.read("u").length, 20);
});
test("ברירת מחדל 500, עותק", () => {
  const f = new FeedStore();
  for (let i = 0; i < 600; i++) f.add("x", i);
  assert.equal(f.size("x"), 500);
  assert.equal(f.read("x", 1000).at(-1), 100);
  const page = f.read("x", 2);
  page.push(-1);
  assert.deepEqual(f.read("x", 2), [599, 598]);
  const g = new FeedStore();
  g.add("a", 1);
  g.add("b", 1);
  assert.deepEqual([g.read("a"), g.read("b")], [[1], [1]]);
});
