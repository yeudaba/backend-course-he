import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mergeFeeds } = await load(import.meta.url, "P28-E89.ts");
const p = (id, at) => ({ id, at });

test("ממזג, מסיר כפולים, חותך", () => {
  const timeline = [p(9, 900), p(7, 700), p(3, 300)];
  const celeb1 = [p(8, 800), p(7, 700), p(2, 200)];
  const celeb2 = [p(10, 700), p(1, 100)];
  const before = JSON.stringify([timeline, celeb1, celeb2]);
  assert.deepEqual(mergeFeeds([timeline, celeb1, celeb2], 5).map((x) => x.id), [9, 8, 10, 7, 3]);
  assert.deepEqual(mergeFeeds([timeline, celeb1, celeb2], 100).map((x) => x.id), [9, 8, 10, 7, 3, 2, 1]);
  assert.equal(JSON.stringify([timeline, celeb1, celeb2]), before, "הקלט לא משתנה");
});
test("קצוות", () => {
  assert.deepEqual(mergeFeeds([], 5), []);
  assert.deepEqual(mergeFeeds([[], []], 5), []);
  assert.deepEqual(mergeFeeds([[p(1, 1)]], 0), []);
  assert.deepEqual(mergeFeeds([[p(5, 10), p(4, 10)], [p(6, 10)]], 3).map((x) => x.id), [6, 5, 4]);
});
test("50 רשימות ארוכות, limit קטן — מהר", () => {
  const lists = Array.from({ length: 50 }, (_, k) => Array.from({ length: 200_000 }, (_, i) => p(k * 1_000_000 + (200_000 - i), 10_000_000 - i * 50 - k)));
  const t0 = performance.now();
  const r = mergeFeeds(lists, 20);
  const took = performance.now() - t0;
  assert.equal(r.length, 20);
  assert.equal(r[0].at, 10_000_000);
  assert.ok(took < 100, `לקח ${Math.round(took)}ms — ממיינים הכול במקום לעצור ב־limit?`);
});
