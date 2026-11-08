import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { shortestPath } = await load(import.meta.url, "P27-E22.ts");

test("לא יוצאים מגבולות המפה", () => {
  assert.equal(shortestPath(["S#E", ".#.", ".#."]), -1, "הקיר חוסם — אין לעקוף 'מבחוץ'");
});
test("הדרך הקצרה — לא הראשונה שנמצאה", () => {
  assert.equal(shortestPath(["S...", "....", "...E"]), 5);
  assert.equal(shortestPath(["S......", ".#####.", ".#...#.", ".#.#.#.", "...#..E"]), 10);
});
test("אין דרך ← −1 (לא 0)", () => {
  assert.equal(shortestPath(["S#", "#E"]), -1);
  assert.equal(shortestPath(["SE"]), 1);
});
