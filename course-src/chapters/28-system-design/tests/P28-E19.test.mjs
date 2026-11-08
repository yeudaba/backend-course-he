import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createFeed } = await load(import.meta.url, "P28-E19.ts");

test("פיד: הפוסטים של מי שעוקבים אחריו, מהחדש", () => {
  const f = createFeed();
  f.follow("dana", "yossi");
  f.follow("dana", "noa");
  f.post("yossi", 10);
  f.post("noa", 20);
  f.post("avi", 30);
  f.post("yossi", 40);
  assert.deepEqual(f.timeline("dana").map((p) => [p.author, p.at]), [["yossi", 40], ["noa", 20], ["yossi", 10]]);
  assert.deepEqual(f.timeline("avi"), []);
});
test("fan-out on write: כתיבה לכל עוקב", () => {
  const f = createFeed();
  for (let i = 0; i < 50; i++) f.follow(`u${i}`, "shop");
  f.post("shop", 1);
  assert.equal(f.stats.timelineWrites, 50);
});
test("סלבריטי: בלי fan-out, ממוזג בקריאה — ובלי כפילויות", () => {
  const f = createFeed({ celebrityThreshold: 3 });
  f.follow("a", "star");
  f.follow("b", "star");
  f.post("star", 5);
  f.follow("c", "star");
  const before = f.stats.timelineWrites;
  f.post("star", 9);
  assert.equal(f.stats.timelineWrites, before, "3 עוקבים = סלבריטי ← אין כתיבות לפידים");
  f.follow("a", "yossi");
  f.post("yossi", 7);
  assert.deepEqual(f.timeline("a").map((p) => [p.author, p.at]), [["star", 9], ["yossi", 7], ["star", 5]]);
  assert.deepEqual(f.timeline("c").map((p) => p.at), [9, 5], "גם פוסט מלפני שעקב — נמשך בקריאה");
});
test("limit ו־timelineCap", () => {
  const f = createFeed({ timelineCap: 5 });
  f.follow("dana", "yossi");
  for (let i = 1; i <= 8; i++) f.post("yossi", i);
  assert.deepEqual(f.timeline("dana", 3).map((p) => p.at), [8, 7, 6]);
  assert.equal(f.timeline("dana", 100).length, 5, "שומרים רק timelineCap בפיד");
});
